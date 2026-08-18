import { Injectable } from '@nestjs/common';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Role } from '../role.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ad soyad zorunlu' })
  full_name!: string;

  @IsOptional()
  @IsIn([Role.TOURIST, Role.MERCHANT, Role.GUIDE], { message: 'Geçersiz rol' })
  role?: Role;
}

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshDto {
  @IsString()
  @Length(20, 512, { message: 'Geçersiz refresh token' })
  refresh_token!: string;
}
