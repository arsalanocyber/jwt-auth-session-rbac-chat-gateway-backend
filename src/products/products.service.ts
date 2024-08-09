import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const { name, description, price } = createProductDto;
    const newProduct = new this.productModel({ name, description, price });
    await newProduct.save();
    return { message: 'Product created successfully' };
  }

  async findAll() {
    const products = await this.productModel.find();
    return products;
  }

  async findOne(id: string) {
    let product;
    try {
      product = await this.productModel.findById(new Types.ObjectId(id)).exec();
    } catch (err) {
      throw new NotFoundException('User not found');
    }
    if (!product) throw new NotFoundException('User not found');
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
