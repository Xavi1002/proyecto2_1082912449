import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

export enum RoleType {
  SUPERADMIN = 'SuperAdmin',
  RECEPCION = 'Recepción',
  CLIENTE = 'Cliente',
}

class Role extends Model {
  public id!: number
  public name!: RoleType
  public description!: string
  public createdAt!: Date
  public updatedAt!: Date
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(...Object.values(RoleType)),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: true,
  }
)

export default Role
