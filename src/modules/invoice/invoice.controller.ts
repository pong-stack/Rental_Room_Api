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
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async getMyInvoices(@Request() req): Promise<ApiResponseDto> {
    const invoices = await this.invoiceService.getInvoicesByUser(req.user.id);
    return ApiResponseDto.success('Invoices retrieved successfully', invoices);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: number, @Request() req): Promise<ApiResponseDto> {
    const invoice = await this.invoiceService.getInvoiceById(id, req.user.id);
    return ApiResponseDto.success('Invoice retrieved successfully', invoice);
  }

  @Post()
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    const invoice = await this.invoiceService.createInvoice(createInvoiceDto, req.user.id);
    return ApiResponseDto.created('Invoice created successfully', invoice);
  }

  @Put(':id/status')
  async updateInvoiceStatus(
    @Param('id') id: number,
    @Body() body: { status: PaymentStatus },
    @Request() req
  ): Promise<ApiResponseDto> {
    const invoice = await this.invoiceService.updateInvoiceStatus(id, body.status, req.user.id);
    return ApiResponseDto.success('Invoice status updated successfully', invoice);
  }

  @Post(':id/items')
  async addItemToInvoice(
    @Param('id') invoiceId: number,
    @Body() createItemDto: CreateInvoiceItemDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    const item = await this.invoiceService.addItemToInvoice(invoiceId, createItemDto, req.user.id);
    return ApiResponseDto.created('Invoice item added successfully', item);
  }

  @Delete('items/:itemId')
  async removeItemFromInvoice(
    @Param('itemId') itemId: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    await this.invoiceService.removeItemFromInvoice(itemId, req.user.id);
    return ApiResponseDto.success('Invoice item removed successfully');
  }

  @Get('home/:homeId')
  async getInvoicesByHome(@Param('homeId') homeId: number): Promise<ApiResponseDto> {
    const invoices = await this.invoiceService.getInvoicesByHome(homeId);
    return ApiResponseDto.success('Home invoices retrieved successfully', invoices);
  }
}
