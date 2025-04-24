const connectionString = 'connection';
console.log(connectionString)

if (!connectionString) {
  throw new Error('SUPABASE_POSTGRES_URL is not defined in the environment variables');
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class BlogPost extends Model {
}

BlogPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'blogPost',
  }
);

export default BlogPost;

