import { bind, Serializable } from "../serialize";

export class DateTime extends Serializable {
  @bind("Timestamp") timestamp!: number;
  @bind("Date") date!: string;
  @bind("Time") time!: string;
}
