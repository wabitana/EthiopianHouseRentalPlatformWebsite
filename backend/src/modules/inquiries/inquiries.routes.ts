import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Helper to format inquiry output with messages list
const formatInquiry = (inq: any) => {
  let messagesList: any[] = [];
  try {
    if (inq.messages && typeof inq.messages === 'string') {
      messagesList = JSON.parse(inq.messages);
    } else if (Array.isArray(inq.messages)) {
      messagesList = inq.messages;
    }
  } catch (_) {
    messagesList = [];
  }

  if (messagesList.length === 0 && inq.message) {
    messagesList.push({
      id: `msg_legacy_1_${inq.id}`,
      senderId: inq.seekerId,
      senderName: inq.seekerName || 'House Seeker',
      senderRole: 'seeker',
      text: inq.message,
      createdAt: inq.createdAt,
    });
    if (inq.response) {
      messagesList.push({
        id: `msg_legacy_2_${inq.id}`,
        senderId: inq.providerId,
        senderName: 'House Provider',
        senderRole: 'provider',
        text: inq.response,
        createdAt: inq.updatedAt || inq.createdAt,
      });
    }
  }

  return {
    id: inq.id,
    propertyId: inq.propertyId,
    propertyTitle: inq.propertyTitle,
    propertyImage: inq.propertyImage,
    seekerId: inq.seekerId,
    seekerName: inq.seekerName,
    seekerPhone: inq.seekerPhone,
    providerId: inq.providerId,
    message: inq.message,
    providerReply: inq.response,
    response: inq.response,
    status: inq.status,
    messages: messagesList,
    createdAt: inq.createdAt,
    updatedAt: inq.updatedAt,
  };
};

// POST /api/v1/inquiries (House Seeker creates inquiry)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const seekerId = req.user?.id;
    if (!seekerId) return res.status(401).json({ error: 'Unauthorized' });

    const seekerUser = await prisma.user.findUnique({ where: { id: seekerId } });
    if (!seekerUser) return res.status(404).json({ error: 'User not found' });

    const { propertyId, message } = req.body;
    if (!propertyId || !message) {
      return res.status(400).json({ error: 'Property ID and message are required' });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    const propertyImage = images && images.length > 0 ? images[0] : '';

    const initialMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: seekerId,
      senderName: seekerUser.name,
      senderRole: 'seeker',
      text: message,
      createdAt: new Date().toISOString(),
    };

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        propertyTitle: property.title,
        propertyImage,
        seekerId,
        seekerName: seekerUser.name,
        seekerPhone: seekerUser.phone,
        providerId: property.providerId,
        message,
        messages: JSON.stringify([initialMessage]),
        status: 'new_inquiry',
      },
    });

    await prisma.property.update({
      where: { id: propertyId },
      data: { inquiriesCount: { increment: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'New Rental Inquiry',
        message: `${seekerUser.name} sent an inquiry for "${property.title}".`,
        type: 'INQUIRY',
      },
    });

    return res.status(201).json(formatInquiry(inquiry));
  } catch (error) {
    console.error('Create inquiry error:', error);
    return res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// GET /api/v1/inquiries (Role-aware: Seekers/Providers see theirs, Admin/Agent see all)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let inquiries;
    if (role === 'admin' || role === 'agent') {
      inquiries = await prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      inquiries = await prisma.inquiry.findMany({
        where: {
          OR: [
            { providerId: userId },
            { seekerId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.json(inquiries.map(formatInquiry));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET /api/v1/inquiries/:id (Get single inquiry with full chat history)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (inquiry.providerId !== userId && inquiry.seekerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    return res.json(formatInquiry(inquiry));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inquiry details' });
  }
});

// POST /api/v1/inquiries/:id/messages (Continuous 2-Way Chatting)
router.post('/:id/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { message, text } = req.body;
    const messageText = message || text;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty' });
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (inquiry.providerId !== userId && inquiry.seekerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to send message in this chat' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isSeeker = userId === inquiry.seekerId;
    const senderRole = isSeeker ? 'seeker' : 'provider';
    const senderName = user?.name || (isSeeker ? inquiry.seekerName : 'House Provider');

    let currentMessages: any[] = [];
    try {
      if (inquiry.messages && typeof inquiry.messages === 'string') {
        currentMessages = JSON.parse(inquiry.messages);
      }
    } catch (_) {
      currentMessages = [];
    }

    if (currentMessages.length === 0 && inquiry.message) {
      currentMessages.push({
        id: `msg_legacy_1_${inquiry.id}`,
        senderId: inquiry.seekerId,
        senderName: inquiry.seekerName || 'House Seeker',
        senderRole: 'seeker',
        text: inquiry.message,
        createdAt: inquiry.createdAt,
      });
      if (inquiry.response) {
        currentMessages.push({
          id: `msg_legacy_2_${inquiry.id}`,
          senderId: inquiry.providerId,
          senderName: 'House Provider',
          senderRole: 'provider',
          text: inquiry.response,
          createdAt: inquiry.updatedAt || inquiry.createdAt,
        });
      }
    }

    const newMessageObj = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: userId,
      senderName,
      senderRole,
      text: messageText.trim(),
      createdAt: new Date().toISOString(),
    };

    currentMessages.push(newMessageObj);

    const newStatus = isSeeker ? inquiry.status : 'responded';
    const newResponse = isSeeker ? inquiry.response : messageText.trim();

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        messages: JSON.stringify(currentMessages),
        status: newStatus,
        response: newResponse,
      },
    });

    const recipientId = isSeeker ? inquiry.providerId : inquiry.seekerId;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: `New Message for "${inquiry.propertyTitle}"`,
          message: `${senderName}: "${messageText.trim().substring(0, 60)}${messageText.length > 60 ? '...' : ''}"`,
          type: isSeeker ? 'INQUIRY' : 'RESPONSE',
        },
      });
    }

    return res.json(formatInquiry(updated));
  } catch (error) {
    console.error('Send chat message error:', error);
    return res.status(500).json({ error: 'Failed to send chat message' });
  }
});

// PATCH /api/v1/inquiries/:id (Provider responds or changes status)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status, response } = req.body;

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (inquiry.providerId !== userId && inquiry.seekerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to modify this inquiry' });
    }

    let currentMessages: any[] = [];
    try {
      if (inquiry.messages && typeof inquiry.messages === 'string') {
        currentMessages = JSON.parse(inquiry.messages);
      }
    } catch (_) {
      currentMessages = [];
    }

    if (response) {
      currentMessages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        senderId: userId,
        senderName: req.user?.role === 'provider' ? 'House Provider' : 'House Seeker',
        senderRole: req.user?.role === 'provider' ? 'provider' : 'seeker',
        text: response.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(response !== undefined && { response }),
        ...(response && { messages: JSON.stringify(currentMessages) }),
      },
    });

    if (response && inquiry.seekerId) {
      await prisma.notification.create({
        data: {
          userId: inquiry.seekerId,
          title: 'Inquiry Response',
          message: `Provider responded to your inquiry for "${inquiry.propertyTitle}": "${response}".`,
          type: 'RESPONSE',
        },
      });
    }

    return res.json(formatInquiry(updated));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// DELETE /api/v1/inquiries/clear-all (Clear all inquiries)
router.delete('/clear-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    if (role === 'admin' || role === 'agent') {
      await prisma.inquiry.deleteMany({});
    } else if (userId) {
      await prisma.inquiry.deleteMany({
        where: {
          OR: [{ seekerId: userId }, { providerId: userId }],
        },
      });
    }

    return res.json({ success: true, message: 'All inquiries cleared' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear inquiries' });
  }
});

// DELETE /api/v1/inquiries/:id (Delete single conversation)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (role !== 'admin' && role !== 'agent' && inquiry.seekerId !== userId && inquiry.providerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this inquiry' });
    }

    await prisma.inquiry.delete({ where: { id } });
    return res.json({ success: true, message: 'Inquiry conversation deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// DELETE /api/v1/inquiries/:id/messages/:messageId (Delete single message inside conversation)
router.delete('/:id/messages/:messageId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, messageId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (role !== 'admin' && role !== 'agent' && inquiry.seekerId !== userId && inquiry.providerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete messages in this inquiry' });
    }

    let currentMessages: any[] = [];
    try {
      if (inquiry.messages && typeof inquiry.messages === 'string') {
        currentMessages = JSON.parse(inquiry.messages);
      }
    } catch (_) {
      currentMessages = [];
    }

    const updatedMessages = currentMessages.filter((m) => m.id !== messageId);
    const lastMsgObj = updatedMessages[updatedMessages.length - 1];

    await prisma.inquiry.update({
      where: { id },
      data: {
        messages: JSON.stringify(updatedMessages),
        message: lastMsgObj ? lastMsgObj.text : 'No messages',
      },
    });

    return res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
