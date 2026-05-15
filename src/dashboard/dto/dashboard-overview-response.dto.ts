export class DashboardMetricDto {
  value: number;
  previous_value: number;
  change_percent: number;
}

export class DashboardRevenueDayDto {
  date: string;
  label: string;
  revenue: number;
}

export class DashboardOverviewResponseDto {
  success: boolean;
  data: {
    message: string;
    updated_at: string;
    range: {
      from: string;
      to: string;
      previous_from: string;
      previous_to: string;
    };
    total_revenue: DashboardMetricDto;
    tickets_sold: DashboardMetricDto;
    revenue_last_7_days: {
      total: number;
      days: DashboardRevenueDayDto[];
    };
  };
}
