import { IsString, IsOptional, IsObject, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeployModuleDto {
    @ApiProperty({ example: 'Image Name' })
    @IsString()
    image: string;

    @ApiProperty({ example: 'Module Name' })
    @IsString()
    moduleName: string;

    @ApiProperty({ example: '{ DB_USER: "sa", DB_PASSWORD: "sa" }' })
    @IsObject()
    @IsOptional()
    envVariables?: Record<string, string>;

    @ApiProperty({ example: 'Container Port' })
    @IsNumber()
    @IsOptional()
    containerPort?: number = 4000;
}