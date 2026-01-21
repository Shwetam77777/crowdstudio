import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface GenerateSongBody {
  lyrics: string;
  genre?: string;
  title?: string;
}

// Simulated AI music generation
// In production, integrate with APIs like:
// - OpenAI for lyrics/composition
// - Suno AI, Mubert, or AIVA for actual audio generation
const generateAIMusic = async (lyrics: string, genre: string = "pop"): Promise<{ audioUrl: string; title: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, return a sample audio URL
  // In production, this would call an actual AI music API
  const sampleAudioUrls = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  ];
  
  const randomIndex = Math.floor(Math.random() * sampleAudioUrls.length);
  
  // Generate a title from the first line of lyrics
  const firstLine = lyrics.split('\n')[0].substring(0, 50);
  const generatedTitle = firstLine || `AI ${genre.charAt(0).toUpperCase() + genre.slice(1)} Song`;
  
  return {
    audioUrl: sampleAudioUrls[randomIndex],
    title: generatedTitle,
  };
};

router.post("/ai/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { lyrics, genre = "pop", title } = req.body as GenerateSongBody;

    if (!lyrics || lyrics.trim().length === 0) {
      res.status(400).json({ error: "Lyrics are required for AI generation" });
      return;
    }

    // Generate AI music
    const { audioUrl, title: generatedTitle } = await generateAIMusic(lyrics, genre);
    
    // Create song in database
    const song = await prisma.song.create({
      data: {
        title: title || generatedTitle,
        description: `AI-generated ${genre} song`,
        audioUrl,
        lyrics,
        genre,
        aiGenerated: true,
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
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      id: song.id,
      title: song.title,
      description: song.description,
      audioUrl: song.audioUrl,
      lyrics: song.lyrics,
      genre: song.genre,
      aiGenerated: song.aiGenerated,
      ownerEmail: song.owner.email,
      ownerId: song.owner.id,
      likeCount: song._count.likes,
      commentCount: song._count.comments,
      createdAt: song.createdAt,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({ error: "Failed to generate AI music" });
  }
});

export default router;
