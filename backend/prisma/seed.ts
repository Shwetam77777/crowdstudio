import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // Create sample users
    const hashedPassword = await hash("password123", 10);

    const producer1 = await prisma.user.upsert({
        where: { email: "producer@example.com" },
        update: {},
        create: {
            email: "producer@example.com",
            password: hashedPassword,
            role: "producer",
        },
    });

    const producer2 = await prisma.user.upsert({
        where: { email: "dj.beats@example.com" },
        update: {},
        create: {
            email: "dj.beats@example.com",
            password: hashedPassword,
            role: "producer",
        },
    });

    const audience = await prisma.user.upsert({
        where: { email: "listener@example.com" },
        update: {},
        create: {
            email: "listener@example.com",
            password: hashedPassword,
            role: "audience",
        },
    });

    console.log("✅ Created users");

    // Sample free audio URLs for testing
    const sampleSongs = [
        {
            title: "Sunset Vibes",
            description: "A chill lofi beat perfect for relaxing evenings",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            ownerId: producer1.id,
        },
        {
            title: "Urban Jungle",
            description: "Hard-hitting trap with deep bass",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            ownerId: producer1.id,
        },
        {
            title: "Morning Coffee",
            description: "Smooth jazz to start your day right",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            ownerId: producer2.id,
        },
        {
            title: "Electric Dreams",
            description: "Synthwave journey through the 80s",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            ownerId: producer2.id,
        },
        {
            title: "Bass Drop",
            description: "Heavy dubstep for the club",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            ownerId: producer1.id,
        },
    ];

    const createdSongs = [];
    for (const songData of sampleSongs) {
        const song = await prisma.song.create({
            data: songData,
        });
        createdSongs.push(song);
        console.log(`✅ Created song: ${song.title}`);
    }

    // Create sample likes
    const likesToCreate = [
        { userId: audience.id, songId: createdSongs[0].id },
        { userId: audience.id, songId: createdSongs[1].id },
        { userId: audience.id, songId: createdSongs[2].id },
        { userId: producer1.id, songId: createdSongs[2].id },
        { userId: producer1.id, songId: createdSongs[3].id },
        { userId: producer2.id, songId: createdSongs[0].id },
        { userId: producer2.id, songId: createdSongs[1].id },
        { userId: producer2.id, songId: createdSongs[4].id },
    ];

    for (const likeData of likesToCreate) {
        await prisma.like.create({
            data: likeData,
        }).catch(() => {
            // Ignore duplicate like errors
        });
    }

    console.log("✅ Created likes");
    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Test accounts:");
    console.log("  Producer: producer@example.com / password123");
    console.log("  Producer: dj.beats@example.com / password123");
    console.log("  Listener: listener@example.com / password123");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
