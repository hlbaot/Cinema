import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { TicketStatus } from '../enums/ticket.enum';

@Entity('tickets')
export class Ticket extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  booking_id: string;

  @ManyToOne(() => Booking, (booking) => booking.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  ticket_code: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  qr_code_url: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.VALID,
  })
  status: TicketStatus;

  @Column({ type: 'timestamp', nullable: true })
  checked_in_at: Date | null;
}
