import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

export enum RoomType {
  INDIVIDUAL = 'Individual',
  DOBLE = 'Doble',
  TRIPLE = 'Triple',
  SUITE = 'Suite',
}

export enum RoomStatus {
  DISPONIBLE = 'Disponible',
  OCUPADA = 'Ocupada',
  MANTENIMIENTO = 'Mantenimiento',
  LIMPIEZA = 'Limpieza',
}

class Room extends Model {
  public id!: number
  public roomNumber!: string
  public type!: RoomType
  public status!: RoomStatus
  public pricePerNight!: number
  public createdAt!: Date
  public updatedAt!: Date
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(RoomType)),
      allowNull: false,
      defaultValue: RoomType.DOBLE,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RoomStatus)),
      allowNull: false,
      defaultValue: RoomStatus.DISPONIBLE,
    },
    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    timestamps: true,
  }
)

export default Room
