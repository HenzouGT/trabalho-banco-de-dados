/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

type FilterValue = string | number | boolean;
type Filters = Record<string, FilterValue>;

export abstract class SupabaseCrudService {
  constructor(protected readonly supabaseService: SupabaseService) {}

  protected async findAllFrom(table: string, orderBy?: string) {
    let query = this.supabase.from(table).select('*');

    if (orderBy) {
      query = query.order(orderBy);
    }

    const { data, error } = await query;
    this.handleError(error);

    return data;
  }

  protected async findOneFrom(
    table: string,
    filters: Filters,
    notFoundMessage: string,
  ) {
    const { data, error } = await this.applyFilters(
      this.supabase.from(table).select('*'),
      filters,
    ).maybeSingle();

    this.handleError(error);
    this.ensureFound(data, notFoundMessage);

    return data;
  }

  protected async createIn(table: string, payload: object) {
    const { data, error } = await this.supabase
      .from(table)
      .insert(payload)
      .select('*')
      .single();

    this.handleError(error);

    return data;
  }

  protected async updateIn(
    table: string,
    filters: Filters,
    payload: object,
    notFoundMessage: string,
  ) {
    const { data, error } = await this.applyFilters(
      this.supabase.from(table).update(payload),
      filters,
    )
      .select('*')
      .maybeSingle();

    this.handleError(error);
    this.ensureFound(data, notFoundMessage);

    return data;
  }

  protected async removeFrom(
    table: string,
    filters: Filters,
    notFoundMessage: string,
  ) {
    const { data, error } = await this.applyFilters(
      this.supabase.from(table).delete(),
      filters,
    )
      .select('*')
      .maybeSingle();

    this.handleError(error);
    this.ensureFound(data, notFoundMessage);

    return data;
  }

  private applyFilters(query: any, filters: Filters) {
    return Object.entries(filters).reduce(
      (currentQuery, [field, value]) => currentQuery.eq(field, value),
      query,
    );
  }

  private handleError(error: { message: string } | null) {
    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  private ensureFound(data: unknown, notFoundMessage: string) {
    if (!data) {
      throw new NotFoundException(notFoundMessage);
    }
  }

  private get supabase() {
    return this.supabaseService.getClient();
  }
}
