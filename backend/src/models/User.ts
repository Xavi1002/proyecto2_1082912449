import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'
import Role, { RoleType } from './Role'

class User extends Model {
  public id!: number
  public name!: string
  public email!: string
  public password!: string
  public roleId!: number
  public isActive!: boolean
  public createdAt!: Date
  public updatedAt!: Date

  public getRole?: () => Promise<Role | null>
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Contraseña hasheada con bcrypt',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
)

// Relaciones
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
})

export default User
