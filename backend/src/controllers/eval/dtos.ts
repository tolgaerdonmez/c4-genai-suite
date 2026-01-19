import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== QA Catalog DTOs ====================

export class QACatalogPreviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['GENERATING', 'READY', 'FAILURE'] })
  status!: 'GENERATING' | 'READY' | 'FAILURE';

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  revision!: number;

  @ApiProperty()
  qaPairsCount!: number;

  @ApiProperty()
  groupId!: string;
}

export class QAPairDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  question!: string;

  @ApiProperty()
  expectedOutput!: string;

  @ApiProperty({ type: [String] })
  contexts!: string[];

  @ApiPropertyOptional()
  metaData?: Record<string, unknown>;
}

export class QACatalogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['GENERATING', 'READY', 'FAILURE'] })
  status!: 'GENERATING' | 'READY' | 'FAILURE';

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  revision!: number;

  @ApiProperty({ type: [QAPairDto] })
  qaPairs!: QAPairDto[];

  @ApiProperty()
  groupId!: string;

  @ApiPropertyOptional()
  error?: string;
}

export class DeleteCatalogResultDto {
  @ApiPropertyOptional()
  previousRevisionId!: string | null;
}

export class QACatalogVersionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  revision!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  qaPairsCount!: number;
}

export class QACatalogVersionHistoryDto {
  @ApiProperty()
  catalogId!: string;

  @ApiProperty({ type: [QACatalogVersionDto] })
  versions!: QACatalogVersionDto[];
}

export class ActiveQACatalogGeneratorTypeDto {
  @ApiProperty()
  type!: string;
}

export class QACatalogGenerationDataDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  generatorType!: string;

  @ApiProperty()
  dataSourceConfigId!: string;

  @ApiPropertyOptional()
  config?: Record<string, unknown>;
}

export class QACatalogGenerationResultDto {
  @ApiProperty()
  catalogId!: string;
}

export class QACatalogUpdateRequestDto {
  @ApiPropertyOptional()
  name?: string;
}

export class DownloadQACatalogOptionsDto {
  @ApiProperty()
  catalogId!: string;

  @ApiProperty({ enum: ['json', 'xlsx'] })
  format!: 'json' | 'xlsx';
}

export class DownloadQACatalogResponseDto {
  @ApiProperty()
  content!: string;

  @ApiProperty()
  filename!: string;
}

// ==================== Query DTOs ====================

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 50 })
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  offset?: number;
}

export class QACatalogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  name?: string;
}
