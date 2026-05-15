import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentStatus } from 'src/payment/enums/payment.enum';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketStatus } from 'src/ticket/enums/ticket.enum';
import { DashboardOverviewResponseDto } from './dto/dashboard-overview-response.dto';

type RevenueRow = {
  date: string | Date;
  revenue: string | number | null;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getOverview(): Promise<DashboardOverviewResponseDto> {
    const { start, end, previousStart, previousEnd } = this.getSevenDayWindows();

    const [
      currentRevenue,
      previousRevenue,
      currentTicketsSold,
      previousTicketsSold,
      revenueRows,
    ] = await Promise.all([
      this.sumPaidRevenue(start, end),
      this.sumPaidRevenue(previousStart, previousEnd),
      this.countSoldTickets(start, end),
      this.countSoldTickets(previousStart, previousEnd),
      this.getDailyRevenue(start, end),
    ]);

    const revenueByDate = new Map(
      revenueRows.map((row) => [this.toDateKey(row.date), Number(row.revenue ?? 0)]),
    );
    const days = this.enumerateDays(start, 7).map((date) => ({
      date: this.toDateKey(date),
      label: this.toVietnameseWeekdayLabel(date),
      revenue: revenueByDate.get(this.toDateKey(date)) ?? 0,
    }));

    return {
      success: true,
      data: {
        message: 'Lấy tổng quan dashboard thành công',
        updated_at: new Date().toISOString(),
        range: {
          from: start.toISOString(),
          to: end.toISOString(),
          previous_from: previousStart.toISOString(),
          previous_to: previousEnd.toISOString(),
        },
        total_revenue: {
          value: currentRevenue,
          previous_value: previousRevenue,
          change_percent: this.calculateChangePercent(currentRevenue, previousRevenue),
        },
        tickets_sold: {
          value: currentTicketsSold,
          previous_value: previousTicketsSold,
          change_percent: this.calculateChangePercent(currentTicketsSold, previousTicketsSold),
        },
        revenue_last_7_days: {
          total: currentRevenue,
          days,
        },
      },
    };
  }

  private getSevenDayWindows() {
    const end = new Date();
    end.setHours(24, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 7);

    const previousEnd = new Date(start);

    return { start, end, previousStart, previousEnd };
  }

  private async sumPaidRevenue(start: Date, end: Date): Promise<number> {
    const row = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.paid_at >= :start', { start })
      .andWhere('payment.paid_at < :end', { end })
      .getRawOne<{ total: string | null }>();

    return Number(row?.total ?? 0);
  }

  private async countSoldTickets(start: Date, end: Date): Promise<number> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.booking', 'booking')
      .innerJoin('booking.payment', 'payment')
      .where('ticket.status != :cancelled', { cancelled: TicketStatus.CANCELLED })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.paid_at >= :start', { start })
      .andWhere('payment.paid_at < :end', { end })
      .getCount();
  }

  private getDailyRevenue(start: Date, end: Date): Promise<RevenueRow[]> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .select("TO_CHAR(payment.paid_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.paid_at >= :start', { start })
      .andWhere('payment.paid_at < :end', { end })
      .groupBy("TO_CHAR(payment.paid_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(payment.paid_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<RevenueRow>();
  }

  private enumerateDays(start: Date, count: number): Date[] {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }

  private toDateKey(value: string | Date): string {
    if (typeof value === 'string') return value.slice(0, 10);
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toVietnameseWeekdayLabel(date: Date): string {
    const day = date.getDay();
    if (day === 0) return 'CN';
    return `T${day + 1}`;
  }

  private calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }
}
