import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @ApiProperty({ example: '田中 リードエンジニア' })
  @IsString()
  evaluator: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  technicalSkills: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  communication: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  problemSolving: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  teamwork: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  culture: number;

  @ApiProperty({ example: 'コミュニケーション能力が高く、技術力も十分...' })
  @IsString()
  comments: string;

  @ApiProperty()
  @IsString()
  candidateId: string;
}