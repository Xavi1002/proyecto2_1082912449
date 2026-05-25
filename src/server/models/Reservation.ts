import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'
import Client from './Client'
import User from './User'
import Room from './Room'

export enum ReservationStatus {
  PENDING = 'Pendiente',
  CONFIRMED = 'Confirmada',
  CANCELLED = 'Cancelada',
  COMPLETED = 'Completada',
}

class Reservation extends Model {
  public id!: number
  public userId!: number
  public clientId!: number | null
  public roomId!: number
  public checkInDate!: Date
  public checkOutDate!: Date
  public numberOfGuests!: number
  public totalPrice!: number
  public pricePerNightSnapshot!: number
  public status!: ReservationStatus
  public specialRequests!: string
  public createdAt!: Date
  public updatedAt!: Date

  // Asociaciones
  public getUser?: () => Promise<User | null>
  public getRoom?: () => Promise<Room | null>
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Client,
        key: 'id',
      },
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Room,
        key: 'id',
      },
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha de entrada',
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha de salida',
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio total de la reserva',
    },
    pricePerNightSnapshot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Snapshot del precio por noche al momento de reservar',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReservationStatus)),
      allowNull: false,
      defaultValue: ReservationStatus.PENDING,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Solicitudes especiales del cliente',
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    timestamps: true,
  }
)

// Relaciones
Reservation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

Reservation.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
})

Reservation.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
})

export default Reservation
