import { User } from '../entities/user.entity';
import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateUserDto extends User {

    /**
     * O e-mail é necessário apra o login, mas não necessariamente precisa ser o mesmo e-mail da
     * rede social que estiver conectada. Login sem rede social precisa de uma senha.
     * @example email@email.com
     */
    @IsEmail()
    email: string;

    /**
     * O nome será utilizado para qualquer coisa (Perfil, Home Page, etc) que precise exibir
     * informações da pessoa conectada.
     * @example Paulo Salvatore
     */
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'password too weak',
    })
    password: string;

    /**
     * O nome será utilizado para qualquer coisa (Perfil, Home Page, etc) que precise exibir
     * informações da pessoa conectada.
     * @example Paulo Salvatore
     */
    @IsString()
    name: string;
}