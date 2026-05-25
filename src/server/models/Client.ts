import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'
import User from './User'

class Client extends Model {
  public id!: number
  public userId!: number | null
  public name!: string
  public email!: string
  public phone!: string | null
  public identificationNumber!: string
  public createdAt!: Date
  public updatedAt!: Date

  public getUser?: () => Promise<User | null>
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    identificationNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true,
  }
)

Client.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

export default Client
