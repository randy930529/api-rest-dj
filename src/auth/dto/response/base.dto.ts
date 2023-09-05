export default abstract class BaseResponseDTO {
  status: string;
  error: { message: string };
  data: {};
}
