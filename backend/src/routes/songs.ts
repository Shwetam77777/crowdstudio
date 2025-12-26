import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface CreateSongBody {
  title: string;
  description?: string;
  audioUrl?: string;
}

router.get("/songs/top", async (_req: Request, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      take: 50,
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        audioUrl: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    const formattedSongs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      description: song.description,
      audioUrl: song.audioUrl,
      ownerEmail: song.owner.email,
      ownerId: song.owner.id,
      likeCount: song._count.likes,
      createdAt: song.createdAt,
    }));

    res.json({ songs: formattedSongs });
  } catch (error) {
    console.error("Get top songs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get producer's own songs
router.get("/songs/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const songs = await prisma.song.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        audioUrl: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    const formattedSongs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      description: song.description,
      audioUrl: song.audioUrl,
      likes: song._count.likes,
      createdAt: song.createdAt,
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error("Error fetching my songs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/songs",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { title, description, audioUrl } = req.body as CreateSongBody;

      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const song = await prisma.song.create({
        data: {
          title,
          description: description || null,
          audioUrl: audioUrl || null,
          ownerId: req.user!.userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      res.status(201).json({
        id: song.id,
        title: song.title,
        description: song.description,
        audioUrl: song.audioUrl,
        ownerEmail: song.owner.email,
        ownerId: song.owner.id,
        likeCount: song._count.likes,
        createdAt: song.createdAt,
      });
    } catch (error) {
      console.error("Create song error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/songs/:id", async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req.params.id, 10);

    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    res.json({
      id: song.id,
      title: song.title,
      description: song.description,
      audioUrl: song.audioUrl,
      ownerEmail: song.owner.email,
      ownerId: song.owner.id,
      likeCount: song._count.likes,
      createdAt: song.createdAt,
    });
  } catch (error) {
    console.error("Get song error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/songs/:id/like",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id, 10);
      const userId = req.user!.userId;

      const song = await prisma.song.findUnique({
        where: { id: songId },
      });

      if (!song) {
        res.status(404).json({ error: "Song not found" });
        return;
      }

      try {
        await prisma.like.create({
          data: {
            userId,
            songId,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          res.status(200).json({ ok: true, message: "Already liked" });
          return;
        }
        throw error;
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Like song error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
