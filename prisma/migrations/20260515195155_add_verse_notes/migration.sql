-- CreateTable
CREATE TABLE "PushSub" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSub_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerseNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VerseNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BibleVerse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "text" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSub_endpoint_key" ON "PushSub"("endpoint");

-- CreateIndex
CREATE INDEX "PushSub_userId_idx" ON "PushSub"("userId");

-- CreateIndex
CREATE INDEX "VerseNote_userId_book_chapter_idx" ON "VerseNote"("userId", "book", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "VerseNote_userId_book_chapter_verse_version_key" ON "VerseNote"("userId", "book", "chapter", "verse", "version");

-- CreateIndex
CREATE INDEX "BibleVerse_version_text_idx" ON "BibleVerse"("version", "text");

-- CreateIndex
CREATE UNIQUE INDEX "BibleVerse_book_chapter_verse_version_key" ON "BibleVerse"("book", "chapter", "verse", "version");
