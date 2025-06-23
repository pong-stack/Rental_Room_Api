import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';

@Controller('user')
export class UserController {
    @Get("all")
    findAll() {
        return 'user';
    }
    @Post()
    create(@Body() createUserDto:CreateUserDto) {
        return createUserDto;
    }
}
