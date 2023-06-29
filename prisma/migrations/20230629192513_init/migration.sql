-- CreateTable
CREATE TABLE "Customer" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Address" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Verified" BOOLEAN NOT NULL DEFAULT false,
    "VerificationCode" TEXT NOT NULL,
    "MfaSecret" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "LocationX" DOUBLE PRECISION NOT NULL,
    "LocationY" DOUBLE PRECISION NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "RestaurantId" INTEGER NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" TEXT NOT NULL,
    "Price" DECIMAL(65,30) NOT NULL,
    "MenuId" INTEGER NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Order" (
    "Id" SERIAL NOT NULL,
    "TotalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "IsPaid" BOOLEAN NOT NULL DEFAULT false,
    "CustomerId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "_MenuItemToOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_Email_key" ON "Customer"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_Email_key" ON "Restaurant"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "_MenuItemToOrder_AB_unique" ON "_MenuItemToOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_MenuItemToOrder_B_index" ON "_MenuItemToOrder"("B");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES "Menu"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToOrder" ADD CONSTRAINT "_MenuItemToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToOrder" ADD CONSTRAINT "_MenuItemToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
