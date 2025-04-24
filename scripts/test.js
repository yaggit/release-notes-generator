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

export default sequelize;