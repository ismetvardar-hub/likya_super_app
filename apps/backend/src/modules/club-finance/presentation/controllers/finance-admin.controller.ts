import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RevenueRouterService } from '../../application/services/revenue-router.service';
import { DirectorLoanService } from '../../application/services/director-loan.service';
import { DualPayrollService } from '../../application/services/dual-payroll.service';
import { SubLeaseService } from '../../application/services/sub-lease.service';
import { JwtAuthGuard } from '../../../../core/auth/jwt-auth.guard';
import type { RouteRevenueDto, CreateDirectorLoanDto, RepayDirectorLoanDto, CreatePayrollSplitDto, CreateSubLeaseDto, BillSubLeaseDto } from '../../application/dtos/club-finance.dtos';

/** Admin REST yüzeyi — kulüp finans orkestrasyonu (guard korumalı). */
@Controller('club-finance')
@UseGuards(JwtAuthGuard)
export class FinanceAdminController {
  constructor(
    private readonly revenueRouter: RevenueRouterService,
    private readonly loans: DirectorLoanService,
    private readonly payroll: DualPayrollService,
    private readonly subLease: SubLeaseService,
  ) {}

  @Post('revenue/route')
  routeRevenue(@Body() dto: RouteRevenueDto) {
    return this.revenueRouter.route(dto);
  }

  @Post('loans')
  createLoan(@Body() dto: CreateDirectorLoanDto) {
    return this.loans.create(dto);
  }

  @Post('loans/:id/repay')
  repayLoan(@Param('id') id: string) {
    return this.loans.repay({ loanId: id });
  }

  @Post('payroll')
  generatePayroll(@Body() body: { month: string; employees: CreatePayrollSplitDto[] }) {
    return this.payroll.generateForMonth(body.employees);
  }

  @Get('payroll/:month')
  payrollByMonth(@Param('month') month: string) {
    return this.payroll.listByMonth(month);
  }

  @Post('sub-lease')
  createSubLease(@Body() dto: CreateSubLeaseDto) {
    return this.subLease.create(dto);
  }

  @Post('sub-lease/:id/bill')
  billSubLease(@Param('id') id: string, @Body() dto: Omit<BillSubLeaseDto, 'contractId'>) {
    return this.subLease.billMonthly({ contractId: id, year: dto.year, month: dto.month });
  }

  @Get('sub-lease/active')
  activeSubLeases() {
    return this.subLease.listActive();
  }
}
