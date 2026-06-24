-- CreateTable
CREATE TABLE "LastReadPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LastReadPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LastReadPosition_userId_key" ON "LastReadPosition"("userId");
