import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, PaymentStatus } from '../../entities/invoice.entity';
import { InvoiceItem } from '../../entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: number): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      userId,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Calculate total amount from items
    if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
      let totalAmount = 0;
      for (const itemDto of createInvoiceDto.items) {
        const item = this.invoiceItemRepository.create({
          ...itemDto,
          invoiceId: savedInvoice.id,
        });
        await this.invoiceItemRepository.save(item);
        totalAmount += itemDto.amount;
      }

      savedInvoice.totalAmount = totalAmount;
      await this.invoiceRepository.save(savedInvoice);
    }

    return this.getInvoiceById(savedInvoice.id, userId);
  }

  async getInvoicesByUser(userId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { userId },
      relations: ['user', 'home', 'items'],
      order: { issuedAt: 'DESC' },
    });
  }

  async getInvoiceById(id: number, userId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['user', 'home', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.userId !== userId) {
      throw new ForbiddenException('You can only view your own invoices');
    }

    return invoice;
  }

  async updateInvoiceStatus(id: number, status: PaymentStatus, userId: number): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id, userId);

    invoice.paymentStatus = status;
    if (status === PaymentStatus.PAID) {
      invoice.paidAt = new Date();
    }

    return this.invoiceRepository.save(invoice);
  }

  async addItemToInvoice(
    invoiceId: number,
    createItemDto: CreateInvoiceItemDto,
    userId: number
  ): Promise<InvoiceItem> {
    const invoice = await this.getInvoiceById(invoiceId, userId);

    const item = this.invoiceItemRepository.create({
      ...createItemDto,
      invoiceId,
    });

    const savedItem = await this.invoiceItemRepository.save(item);

    // Update invoice total
    const allItems = await this.invoiceItemRepository.find({ where: { invoiceId } });
    const totalAmount = allItems.reduce((sum, item) => sum + item.amount, 0);

    invoice.totalAmount = totalAmount;
    await this.invoiceRepository.save(invoice);

    return savedItem;
  }

  async removeItemFromInvoice(itemId: number, userId: number): Promise<void> {
    const item = await this.invoiceItemRepository.findOne({
      where: { id: itemId },
      relations: ['invoice'],
    });

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    if (item.invoice.userId !== userId) {
      throw new ForbiddenException('You can only remove items from your own invoices');
    }

    await this.invoiceItemRepository.remove(item);

    // Update invoice total
    const invoice = await this.getInvoiceById(item.invoiceId, userId);
    const remainingItems = await this.invoiceItemRepository.find({
      where: { invoiceId: invoice.id },
    });
    const totalAmount = remainingItems.reduce((sum, item) => sum + item.amount, 0);

    invoice.totalAmount = totalAmount;
    await this.invoiceRepository.save(invoice);
  }

  async getInvoicesByHome(homeId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { homeId },
      relations: ['user', 'home', 'items'],
      order: { issuedAt: 'DESC' },
    });
  }
}
