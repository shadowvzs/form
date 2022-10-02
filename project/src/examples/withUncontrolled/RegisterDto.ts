interface RegisterDto {
    username: string;
    fullname: string;
    email: string;
    password: string;
    agree: boolean;
    sex: number;
    image: File;
}

export default RegisterDto;