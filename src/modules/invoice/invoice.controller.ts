import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentStatus } from '../../entities/invoice.entity';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async getMyInvoices(@Request() req) {
    return this.invoiceService.getInvoicesByUser(req.user.id);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: number, @Request() req) {
    return this.invoiceService.getInvoiceById(id, req.user.id);
  }

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoiceService.createInvoice(createInvoiceDto, req.user.id);
  }

  @Put(':id/status')
  async updateInvoiceStatus(
    @Param('id') id: number,
    @Body() body: { status: PaymentStatus },
    @Request() req
  ) {
    return this.invoiceService.updateInvoiceStatus(id, body.status, req.user.id);
  }

  @Post(':id/items')
  async addItemToInvoice(
    @Param('id') invoiceId: number,
    @Body() createItemDto: CreateInvoiceItemDto,
    @Request() req
  ) {
    return this.invoiceService.addItemToInvoice(invoiceId, createItemDto, req.user.id);
  }

  @Delete('items/:itemId')
  async removeItemFromInvoice(@Param('itemId') itemId: number, @Request() req) {
    await this.invoiceService.removeItemFromInvoice(itemId, req.user.id);
    return { message: 'Invoice item removed successfully' };
  }

  @Get('home/:homeId')
  async getInvoicesByHome(@Param('homeId') homeId: number) {
    return this.invoiceService.getInvoicesByHome(homeId);
  }
}
