-- CreateTable
CREATE TABLE "ChapterRead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChapterRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChapterRead_userId_idx" ON "ChapterRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterRead_userId_book_chapter_key" ON "ChapterRead"("userId", "book", "chapter");
