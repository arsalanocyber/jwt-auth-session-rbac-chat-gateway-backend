// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/roles.decorator';
import { ProductGuard } from './products.guard';
import { LimitProductsInterceptor } from './interceptors/LimitProductsInterceptor';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(ProductGuard)
  @Roles('admin') // Added rol based authentication here, only admin can create a product, we can add ['admin', 'user'] to allow user to create the product
  @Post('')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(ProductGuard)
  @Roles('admin') // Created custom decorator here for roles.
  @UseInterceptors(LimitProductsInterceptor) //testing interceptor here to modify the response, I checked if we can get 3 products instead of all, check interceptor file for more details.
  @Get('')
  findAll() {
    return this.productsService.findAll();
  }

  @UseGuards(ProductGuard)
  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(ProductGuard)
  @Roles('admin') // Only admin can update products
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(ProductGuard)
  @Roles('admin') // Only admin can delete products
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
