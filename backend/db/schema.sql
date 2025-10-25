-- ============================================
-- CARBON CREDIT MARKETPLACE DATABASE SCHEMA
-- Complete setup script for PostgreSQL
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS gpu_emissions_calculations CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;
DROP TABLE IF EXISTS carbon_credits CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS carbon_projects CASCADE;

-- ============================================
-- TABLE 1: carbon_projects
-- ============================================
CREATE TABLE carbon_projects (
    id SERIAL PRIMARY KEY,

    -- Verra/Gold Standard format fields
    project_id VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    registry_type VARCHAR(50) NOT NULL,

    -- Project details
    methodology VARCHAR(100),
    project_type VARCHAR(100),
    location_country VARCHAR(100),
    location_region VARCHAR(100),

    -- Carbon details
    total_credits_issued INTEGER NOT NULL,
    vintage_year INTEGER NOT NULL,
    verification_date DATE,

    -- Additional info
    co_benefits TEXT[],
    project_description TEXT,
    project_status VARCHAR(50) DEFAULT 'Active',

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 2: carbon_credits
-- ============================================
CREATE TABLE carbon_credits (
    id SERIAL PRIMARY KEY,

    -- Links to project
    project_id VARCHAR(50) NOT NULL REFERENCES carbon_projects(project_id),

    -- Credit identification (Verra format)
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    credit_block_start BIGINT NOT NULL,
    credit_block_end BIGINT NOT NULL,

    -- Amount
    quantity DECIMAL(10, 2) NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'Active',

    -- Blockchain integration
    token_mint_address VARCHAR(100),
    is_tokenized BOOLEAN DEFAULT FALSE,

    -- Ownership
    current_owner_wallet VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 3: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    -- Wallet info
    wallet_address VARCHAR(100) UNIQUE NOT NULL,

    -- Profile (optional)
    email VARCHAR(255),
    user_type VARCHAR(50),
    company_name VARCHAR(255),

    -- Stats
    total_credits_purchased DECIMAL(10, 2) DEFAULT 0,
    total_credits_sold DECIMAL(10, 2) DEFAULT 0,
    total_co2_offset DECIMAL(10, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 4: marketplace_listings
-- ============================================
CREATE TABLE marketplace_listings (
    id SERIAL PRIMARY KEY,

    -- What's being sold
    credit_id INTEGER NOT NULL REFERENCES carbon_credits(id),

    -- Seller info
    seller_wallet VARCHAR(100) NOT NULL,

    -- Pricing
    price_usdc DECIMAL(10, 2) NOT NULL,
    quantity_available DECIMAL(10, 2) NOT NULL,

    -- Listing status
    status VARCHAR(50) DEFAULT 'Active',

    -- Timestamps
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP
);

-- ============================================
-- TABLE 5: transactions
-- ============================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    -- Transaction parties
    buyer_wallet VARCHAR(100) NOT NULL,
    seller_wallet VARCHAR(100) NOT NULL,

    -- What was traded
    listing_id INTEGER REFERENCES marketplace_listings(id),
    credit_id INTEGER NOT NULL REFERENCES carbon_credits(id),

    -- Transaction details
    quantity DECIMAL(10, 2) NOT NULL,
    price_per_credit DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2),

    -- Blockchain
    transaction_signature VARCHAR(200),
    block_timestamp TIMESTAMP,

    -- Status
    status VARCHAR(50) DEFAULT 'Completed',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 6: gpu_emissions_calculations
-- ============================================
CREATE TABLE gpu_emissions_calculations (
    id SERIAL PRIMARY KEY,

    -- User info
    user_wallet VARCHAR(100) REFERENCES users(wallet_address),

    -- GPU details
    gpu_type VARCHAR(100) NOT NULL,
    gpu_hours DECIMAL(10, 2) NOT NULL,

    -- Calculation results
    power_consumption_kwh DECIMAL(10, 4),
    co2_emissions_kg DECIMAL(10, 4) NOT NULL,
    co2_emissions_tons DECIMAL(10, 6) NOT NULL,
    credits_needed DECIMAL(10, 6) NOT NULL,

    -- Region (affects carbon intensity)
    region VARCHAR(100) DEFAULT 'US',
    carbon_intensity DECIMAL(10, 4),

    -- Status
    is_offset BOOLEAN DEFAULT FALSE,
    transaction_id INTEGER REFERENCES transactions(id),

    -- Timestamps
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT MOCK DATA
-- ============================================

-- carbon_projects data (15 entries)
INSERT INTO carbon_projects (project_id, project_name, registry_type, methodology, project_type, location_country, location_region, total_credits_issued, vintage_year, verification_date, co_benefits, project_description, project_status) VALUES
('VCS-1234', 'Kenya Smallholder Reforestation Project', 'Verra', 'VM0015', 'Forestry', 'Kenya', 'Rift Valley', 50000, 2024, '2024-03-15', ARRAY['Biodiversity conservation', 'Community employment', 'Soil improvement'], 'Community-led reforestation initiative supporting 500 smallholder farmers in Kenya. Trees planted include indigenous species that restore degraded land while providing income through sustainable harvesting.', 'Active'),
('GS-5678', 'India Solar Power Generation', 'Gold Standard', 'GS-ACM0002', 'Renewable Energy', 'India', 'Rajasthan', 120000, 2023, '2023-11-20', ARRAY['Clean energy access', 'Job creation', 'Reduced air pollution'], 'Large-scale solar farm providing clean electricity to 50,000 households in rural Rajasthan, replacing coal-based power generation.', 'Active'),
('VCS-2456', 'Amazon Rainforest Conservation', 'Verra', 'VM0007', 'Forestry', 'Brazil', 'Amazonas', 200000, 2024, '2024-01-10', ARRAY['Biodiversity conservation', 'Indigenous community support', 'Water cycle protection'], 'REDD+ project protecting 100,000 hectares of Amazon rainforest from deforestation. Works with indigenous communities to provide sustainable livelihoods.', 'Active'),
('GS-7890', 'Vietnam Wind Energy Project', 'Gold Standard', 'GS-ACM0002', 'Renewable Energy', 'Vietnam', 'Ninh Thuan', 80000, 2023, '2023-09-05', ARRAY['Clean energy', 'Economic development', 'Energy independence'], 'Offshore wind farm generating 250 MW of clean energy, displacing fossil fuel-based electricity generation.', 'Active'),
('VCS-3789', 'Peru Sustainable Agriculture', 'Verra', 'VM0026', 'Agriculture', 'Peru', 'Cusco', 35000, 2024, '2024-02-28', ARRAY['Improved soil health', 'Farmer income increase', 'Food security'], 'Regenerative agriculture practices across 5,000 hectares, sequestering carbon in soil while improving crop yields for 300 farming families.', 'Active'),
('VCS-4123', 'Indonesia Peatland Restoration', 'Verra', 'VM0033', 'Forestry', 'Indonesia', 'Kalimantan', 150000, 2023, '2023-07-22', ARRAY['Biodiversity conservation', 'Fire prevention', 'Water management'], 'Restoration of 75,000 hectares of degraded peatland, preventing CO2 emissions from peat fires and restoring critical orangutan habitat.', 'Active'),
('GS-8901', 'Morocco Solar Thermal Plant', 'Gold Standard', 'GS-ACM0002', 'Renewable Energy', 'Morocco', 'Ouarzazate', 95000, 2024, '2024-04-12', ARRAY['Clean energy', 'Technology transfer', 'Employment'], 'Concentrated solar power plant with thermal storage, providing 24/7 clean electricity to 100,000 homes.', 'Active'),
('VCS-5234', 'Tanzania Cookstove Distribution', 'Verra', 'VM0010', 'Energy Efficiency', 'Tanzania', 'Dar es Salaam', 45000, 2023, '2023-10-08', ARRAY['Indoor air quality', 'Forest conservation', 'Health improvement', 'Women empowerment'], 'Distribution of 30,000 efficient cookstoves to rural households, reducing firewood consumption by 60% and improving health outcomes.', 'Active'),
('GS-9012', 'Philippines Biogas Systems', 'Gold Standard', 'GS-AMS-III.R', 'Renewable Energy', 'Philippines', 'Mindanao', 28000, 2024, '2024-05-30', ARRAY['Waste management', 'Clean cooking', 'Organic fertilizer production'], 'Installation of 5,000 household biogas digesters converting agricultural waste into cooking fuel and organic fertilizer.', 'Active'),
('VCS-6345', 'Colombia Mangrove Restoration', 'Verra', 'VM0033', 'Blue Carbon', 'Colombia', 'Pacific Coast', 67000, 2024, '2024-06-18', ARRAY['Coastal protection', 'Fisheries support', 'Biodiversity'], 'Restoration of 15,000 hectares of mangrove forests, sequestering carbon while protecting coastal communities from storms.', 'Active'),
('GS-0123', 'Thailand Biomass Energy', 'Gold Standard', 'GS-ACM0006', 'Renewable Energy', 'Thailand', 'Chiang Mai', 52000, 2023, '2023-12-14', ARRAY['Agricultural waste utilization', 'Rural electrification', 'Air quality'], 'Biomass power plant using rice husks and agricultural residues to generate 15 MW of electricity for rural communities.', 'Active'),
('VCS-7456', 'Madagascar Forest Conservation', 'Verra', 'VM0007', 'Forestry', 'Madagascar', 'Atsinanana', 110000, 2024, '2024-07-25', ARRAY['Lemur habitat protection', 'Ecotourism', 'Community development'], 'REDD+ project protecting 50,000 hectares of unique rainforest ecosystem, home to endemic species found nowhere else on Earth.', 'Active'),
('GS-1234', 'Bangladesh Solar Home Systems', 'Gold Standard', 'GS-AMS-I.A', 'Renewable Energy', 'Bangladesh', 'Rural Districts', 88000, 2023, '2023-08-30', ARRAY['Energy access', 'Education support', 'Economic empowerment'], 'Installation of 60,000 solar home systems in off-grid rural areas, providing clean electricity for lighting and phone charging.', 'Active'),
('VCS-8567', 'Chile Native Forest Protection', 'Verra', 'VM0015', 'Forestry', 'Chile', 'Los Rios', 75000, 2024, '2024-08-05', ARRAY['Water conservation', 'Indigenous rights', 'Wildlife protection'], 'Conservation of 40,000 hectares of native Valdivian temperate rainforest, protecting critical water sources and biodiversity.', 'Active'),
('GS-2345', 'Nepal Micro-Hydro Project', 'Gold Standard', 'GS-ACM0002', 'Renewable Energy', 'Nepal', 'Himalayas', 41000, 2024, '2024-09-12', ARRAY['Rural electrification', 'Local grid development', 'Education'], 'Network of 25 micro-hydropower plants providing clean electricity to 15,000 mountain households previously relying on kerosene.', 'Active');

-- carbon_credits data (15 entries)
INSERT INTO carbon_credits (project_id, serial_number, credit_block_start, credit_block_end, quantity, status, token_mint_address, is_tokenized, current_owner_wallet) VALUES
('VCS-1234', 'VCS-1234-2024-001-001-001', 1, 1000, 1000.00, 'Active', NULL, FALSE, NULL),
('VCS-1234', 'VCS-1234-2024-001-001-002', 1001, 2000, 1000.00, 'Active', NULL, FALSE, NULL),
('GS-5678', 'GS-5678-2023-001-001-001', 1, 5000, 5000.00, 'Active', NULL, FALSE, NULL),
('VCS-2456', 'VCS-2456-2024-001-001-001', 1, 10000, 10000.00, 'Active', NULL, FALSE, NULL),
('GS-7890', 'GS-7890-2023-001-001-001', 1, 3000, 3000.00, 'Active', NULL, FALSE, NULL),
('VCS-3789', 'VCS-3789-2024-001-001-001', 1, 2500, 2500.00, 'Active', NULL, FALSE, NULL),
('VCS-4123', 'VCS-4123-2023-001-001-001', 1, 7500, 7500.00, 'Active', NULL, FALSE, NULL),
('GS-8901', 'GS-8901-2024-001-001-001', 1, 4500, 4500.00, 'Active', NULL, FALSE, NULL),
('VCS-5234', 'VCS-5234-2023-001-001-001', 1, 2000, 2000.00, 'Active', NULL, FALSE, NULL),
('GS-9012', 'GS-9012-2024-001-001-001', 1, 1500, 1500.00, 'Active', NULL, FALSE, NULL),
('VCS-6345', 'VCS-6345-2024-001-001-001', 1, 3500, 3500.00, 'Active', NULL, FALSE, NULL),
('GS-0123', 'GS-0123-2023-001-001-001', 1, 2800, 2800.00, 'Active', NULL, FALSE, NULL),
('VCS-7456', 'VCS-7456-2024-001-001-001', 1, 6000, 6000.00, 'Active', NULL, FALSE, NULL),
('GS-1234', 'GS-1234-2023-001-001-001', 1, 4000, 4000.00, 'Active', NULL, FALSE, NULL),
('VCS-8567', 'VCS-8567-2024-001-001-001', 1, 3800, 3800.00, 'Active', NULL, FALSE, NULL);

-- users data (15 entries)
INSERT INTO users (wallet_address, email, user_type, company_name, total_credits_purchased, total_credits_sold, total_co2_offset) VALUES
('JqQ3eS1VtWcXbR5NdP9HmZvFyIoC4BsQnElTcDzKwG8B', 'john.smith@techcorp.com', 'Buyer', 'TechCorp AI Solutions', 100.00, 0.00, 100.00),
('KrR4fT2WuXdYcS6OeQ0InAwGzJpD5CtRoFmUdEaLxH9C', 'sarah.jones@cloudservices.io', 'Buyer', 'Cloud Services Inc', 250.00, 0.00, 250.00),
('LsS5gU3XvYeZdT7PfR1JoBxHaKqE6DuSpGnVeEbMyI0D', 'michael.chen@dataanalytics.com', 'Buyer', 'Data Analytics Pro', 500.00, 0.00, 500.00),
('MtT6hV4YwZfAeU8QgS2KpCyIbLrF7EvTqHoWfFcNzJ1E', 'emma.wilson@airesearch.org', 'Buyer', 'AI Research Labs', 1000.00, 0.00, 1000.00),
('NuU7iW5ZxAgBfV9RhT3LqDzJcMsG8FwUrIpXgGdOaK2F', 'david.brown@mlstartup.io', 'Buyer', 'ML Startup', 300.00, 0.00, 300.00),
('OvV8jX6AyBhCgW0SiU4MrEaKdNtH9GxVsJqYhHeQbL3G', 'lisa.garcia@deeplearning.ai', 'Buyer', 'DeepLearning Systems', 400.00, 0.00, 400.00),
('PwW9kY7BzCiDhX1TjV5NsFbLeMuI0HyWtKrZiIfRcM4H', 'james.taylor@computecloud.com', 'Buyer', 'Compute Cloud', 750.00, 0.00, 750.00),
('QxX0lZ8CaDjEiY2UkW6OtGcMfNvJ1IzXuLsAjJgSdN5I', 'maria.rodriguez@gpuhosting.net', 'Buyer', 'GPU Hosting Solutions', 600.00, 0.00, 600.00),
('RyY1mA9DbEkFjZ3VlX7PuHdNgOwK2JaYvMtBkKhTeO6J', 'robert.lee@neuralnet.io', 'Buyer', 'NeuralNet Technologies', 200.00, 0.00, 200.00),
('SzZ2nB0EcFlGkA4WmY8QvIeOhPxL3KbZwNuClLiUfP7K', 'jennifer.white@aimodels.com', 'Buyer', 'AI Models Corp', 150.00, 0.00, 150.00),
('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'project@kenya-forest.org', 'Seller', 'Kenya Forest Conservation Project', 0.00, 350.00, 0.00),
('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', 'admin@india-solar.com', 'Seller', 'India Solar Power', 0.00, 500.00, 0.00),
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'contact@amazon-conservation.br', 'Seller', 'Amazon Rainforest Conservation', 0.00, 1000.00, 0.00),
('H4RdPkKRSfnYzW8YJrxVPhwxBvhKmW45bUzVjVhGvAXd', 'info@vietnam-wind.vn', 'Seller', 'Vietnam Wind Energy', 0.00, 300.00, 0.00),
('FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK2bYKsYdnqjKjQ', 'admin@peru-agriculture.pe', 'Seller', 'Peru Sustainable Agriculture', 0.00, 400.00, 0.00);

-- Additional users referenced by transactions/gpu_emissions_calculations
INSERT INTO users (wallet_address, email, user_type, company_name, total_credits_purchased, total_credits_sold, total_co2_offset) VALUES
('TaA3oC1FdGmHlB5XnZ9RwJfPiQyM4LcAwOvDmMjVgQ8L', 'placeholder1@example.com', 'Buyer', 'Placeholder Company A', 0.00, 0.00, 0.00),
('UbB4pD2GeHnImC6YoA0SxKgQjRzN5MdBxPwEnNkWhR9M', 'placeholder2@example.com', 'Buyer', 'Placeholder Company B', 0.00, 0.00, 0.00),
('VcC5qE3HfIoJnD7ZpB1TyLhRkSaO6NeByQxFoOlXiS0N', 'placeholder3@example.com', 'Buyer', 'Placeholder Company C', 0.00, 0.00, 0.00),
('WdD6rF4IgJpKoE8AqC2UzMiSlTbP7OfCzRyGpPmYjT1O', 'placeholder4@example.com', 'Buyer', 'Placeholder Company D', 0.00, 0.00, 0.00),
('XeE7sG5JhKqLpF9BrD3VaMjTmUcQ8PgDaShHqQnZkU2P', 'placeholder5@example.com', 'Buyer', 'Placeholder Company E', 0.00, 0.00, 0.00);

-- marketplace_listings data (15 entries)
INSERT INTO marketplace_listings (credit_id, seller_wallet, price_usdc, quantity_available, status) VALUES
(1, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 12.50, 500.00, 'Active'),
(2, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 12.50, 800.00, 'Active'),
(3, 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', 8.75, 3000.00, 'Active'),
(4, '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 25.00, 5000.00, 'Active'),
(5, 'H4RdPkKRSfnYzW8YJrxVPhwxBvhKmW45bUzVjVhGvAXd', 10.20, 2000.00, 'Active'),
(6, 'FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK2bYKsYdnqjKjQ', 14.80, 1500.00, 'Active'),
(7, '3htEqCwBqFZrH4kHcPvvJQqTz3vVZPvJbJYzKjHvVN8k', 18.50, 4000.00, 'Active'),
(8, 'BkN5vA8zQrYbF9kRH2kKjW7JyPvX5mTgHqYjKvCpQw3L', 11.00, 3500.00, 'Active'),
(9, 'CqP4wR6XnJdTvKyH8LmZ3BfGpWjK5VxNhYrMwQsEtA9U', 16.25, 1200.00, 'Active'),
(10, 'DtK7yM5PnQwRvL9HxJ3BgTpZsCjW8VmKhYfNwXuEqA2V', 9.50, 1000.00, 'Active'),
(11, 'EhL8zN6QoRxSwM0IyK4ChUqAtDkX9WnLiZgOxYvFrB3W', 22.00, 2500.00, 'Active'),
(12, 'FmM9aO7RpSyTxN1JzL5DiVrBuEkY0XoMjAhPyZwGsC4X', 13.75, 2000.00, 'Active'),
(13, 'GnN0bP8SqTzUyO2KaM6EjWsCvFlZ1YpNkBiQzAxHtD5Y', 20.50, 4500.00, 'Active'),
(14, 'HoO1cQ9TrUaVzP3LbN7FkXtDwGmA2ZqOlCjRaBxIuE6Z', 15.00, 3000.00, 'Active'),
(15, 'IpP2dR0UsVbWaQ4McO8GlYuExHnB3ArPmDkSbCyJvF7A', 19.25, 2800.00, 'Active');

-- transactions data (15 entries)
INSERT INTO transactions (buyer_wallet, seller_wallet, listing_id, credit_id, quantity, price_per_credit, total_amount, platform_fee, transaction_signature, block_timestamp, status) VALUES
('JqQ3eS1VtWcXbR5NdP9HmZvFyIoC4BsQnElTcDzKwG8B', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 1, 1, 100.00, 12.50, 1250.00, 62.50, '5J7k8mN9pQ2rS3tU4vW5xY6zA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6t', '2024-10-15 14:23:45', 'Completed'),
('KrR4fT2WuXdYcS6OeQ0InAwGzJpD5CtRoFmUdEaLxH9C', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 2, 2, 250.00, 12.50, 3125.00, 156.25, '6K8l9nO0qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7u', '2024-10-16 09:15:22', 'Completed'),
('LsS5gU3XvYeZdT7PfR1JoBxHaKqE6DuSpGnVeEbMyI0D', 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', 3, 3, 500.00, 8.75, 4375.00, 218.75, '7L9m0oP1rS4tU5vW6xY7zA8bC9dE0fG1hI2jK3lM4nO5pQ6rS7tU8v', '2024-10-17 11:42:18', 'Completed'),
('MtT6hV4YwZfAeU8QgS2KpCyIbLrF7EvTqHoWfFcNzJ1E', '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 4, 4, 1000.00, 25.00, 25000.00, 1250.00, '8M0n1pQ2sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9w', '2024-10-18 16:30:55', 'Completed'),
('NuU7iW5ZxAgBfV9RhT3LqDzJcMsG8FwUrIpXgGdOaK2F', 'H4RdPkKRSfnYzW8YJrxVPhwxBvhKmW45bUzVjVhGvAXd', 5, 5, 300.00, 10.20, 3060.00, 153.00, '9N1o2qR3tU6vW7xY8zA9bC0dE1fG2hI3jK4lM5nO6pQ7rS8tU9vW0x', '2024-10-19 08:17:33', 'Completed'),
('OvV8jX6AyBhCgW0SiU4MrEaKdNtH9GxVsJqYhHeQbL3G', 'FwR3PbjS5iyqzLiLugrBqKSa5EKZ4vK2bYKsYdnqjKjQ', 6, 6, 400.00, 14.80, 5920.00, 296.00, '0O2p3rS4uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1y', '2024-10-20 13:45:12', 'Completed'),
('PwW9kY7BzCiDhX1TjV5NsFbLeMuI0HyWtKrZiIfRcM4H', '3htEqCwBqFZrH4kHcPvvJQqTz3vVZPvJbJYzKjHvVN8k', 7, 7, 750.00, 18.50, 13875.00, 693.75, '1P3q4sT5vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2z', '2024-10-21 10:22:47', 'Completed'),
('QxX0lZ8CaDjEiY2UkW6OtGcMfNvJ1IzXuLsAjJgSdN5I', 'BkN5vA8zQrYbF9kRH2kKjW7JyPvX5mTgHqYjKvCpQw3L', 8, 8, 600.00, 11.00, 6600.00, 330.00, '2Q4r5tU6wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3a', '2024-10-22 15:55:29', 'Completed'),
('RyY1mA9DbEkFjZ3VlX7PuHdNgOwK2JaYvMtBkKhTeO6J', 'CqP4wR6XnJdTvKyH8LmZ3BfGpWjK5VxNhYrMwQsEtA9U', 9, 9, 200.00, 16.25, 3250.00, 162.50, '3R5s6uV7xY0zA1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4b', '2024-10-23 12:08:16', 'Completed'),
('SzZ2nB0EcFlGkA4WmY8QvIeOhPxL3KbZwNuClLiUfP7K', 'DtK7yM5PnQwRvL9HxJ3BgTpZsCjW8VmKhYfNwXuEqA2V', 10, 10, 150.00, 9.50, 1425.00, 71.25, '4S6t7vW8yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5c', '2024-10-23 17:33:51', 'Completed'),
('TaA3oC1FdGmHlB5XnZ9RwJfPiQyM4LcAwOvDmMjVgQ8L', 'EhL8zN6QoRxSwM0IyK4ChUqAtDkX9WnLiZgOxYvFrB3W', 11, 11, 800.00, 22.00, 17600.00, 880.00, '5T7u8wX9aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6e', '2024-10-24 09:12:38', 'Completed'),
('UbB4pD2GeHnImC6YoA0SxKgQjRzN5MdBxPwEnNkWhR9M', 'FmM9aO7RpSyTxN1JzL5DiVrBuEkY0XoMjAhPyZwGsC4X', 12, 12, 350.00, 13.75, 4812.50, 240.63, '6U8v9xY0bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6dE7f', '2024-10-24 11:47:22', 'Completed'),
('VcC5qE3HfIoJnD7ZpB1TyLhRkSaO6NeByQxFoOlXiS0N', 'GnN0bP8SqTzUyO2KaM6EjWsCvFlZ1YpNkBiQzAxHtD5Y', 13, 13, 900.00, 20.50, 18450.00, 922.50, '7V9w0yZ1cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8g', '2024-10-24 14:25:09', 'Completed'),
('WdD6rF4IgJpKoE8AqC2UzMiSlTbP7OfCzRyGpPmYjT1O', 'HoO1cQ9TrUaVzP3LbN7FkXtDwGmA2ZqOlCjRaBxIuE6Z', 14, 14, 550.00, 15.00, 8250.00, 412.50, '8W0x1zA2dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8fG9h', '2024-10-24 16:52:44', 'Completed'),
('XeE7sG5JhKqLpF9BrD3VaMjTmUcQ8PgDaShHqQnZkU2P', 'IpP2dR0UsVbWaQ4McO8GlYuExHnB3ArPmDkSbCyJvF7A', 15, 15, 425.00, 19.25, 8181.25, 409.06, '9X1y2aB3eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9gH0i', '2024-10-24 18:39:17', 'Completed');

-- gpu_emissions_calculations data (15 entries)
INSERT INTO gpu_emissions_calculations (user_wallet, gpu_type, gpu_hours, power_consumption_kwh, co2_emissions_kg, co2_emissions_tons, credits_needed, region, carbon_intensity, is_offset, transaction_id) VALUES
('JqQ3eS1VtWcXbR5NdP9HmZvFyIoC4BsQnElTcDzKwG8B', 'A100', 250.00, 100.0000, 40.0000, 0.040000, 0.040000, 'US', 0.4000, TRUE, 1),
('KrR4fT2WuXdYcS6OeQ0InAwGzJpD5CtRoFmUdEaLxH9C', 'H100', 500.00, 350.0000, 140.0000, 0.140000, 0.140000, 'US', 0.4000, TRUE, 2),
('LsS5gU3XvYeZdT7PfR1JoBxHaKqE6DuSpGnVeEbMyI0D', 'V100', 1000.00, 300.0000, 240.0000, 0.240000, 0.240000, 'China', 0.8000, TRUE, 3),
('MtT6hV4YwZfAeU8QgS2KpCyIbLrF7EvTqHoWfFcNzJ1E', 'A100', 2500.00, 1000.0000, 400.0000, 0.400000, 0.400000, 'US', 0.4000, TRUE, 4),
('NuU7iW5ZxAgBfV9RhT3LqDzJcMsG8FwUrIpXgGdOaK2F', 'H100', 600.00, 420.0000, 168.0000, 0.168000, 0.168000, 'US', 0.4000, TRUE, 5),
('OvV8jX6AyBhCgW0SiU4MrEaKdNtH9GxVsJqYhHeQbL3G', 'A100', 1000.00, 400.0000, 160.0000, 0.160000, 0.160000, 'US', 0.4000, TRUE, 6),
('PwW9kY7BzCiDhX1TjV5NsFbLeMuI0HyWtKrZiIfRcM4H', 'V100', 2500.00, 750.0000, 300.0000, 0.300000, 0.300000, 'US', 0.4000, TRUE, 7),
('QxX0lZ8CaDjEiY2UkW6OtGcMfNvJ1IzXuLsAjJgSdN5I', 'A100', 1500.00, 600.0000, 240.0000, 0.240000, 0.240000, 'US', 0.4000, TRUE, 8),
('RyY1mA9DbEkFjZ3VlX7PuHdNgOwK2JaYvMtBkKhTeO6J', 'H100', 400.00, 280.0000, 112.0000, 0.112000, 0.112000, 'US', 0.4000, TRUE, 9),
('SzZ2nB0EcFlGkA4WmY8QvIeOhPxL3KbZwNuClLiUfP7K', 'V100', 500.00, 150.0000, 120.0000, 0.120000, 0.120000, 'China', 0.8000, TRUE, 10),
('TaA3oC1FdGmHlB5XnZ9RwJfPiQyM4LcAwOvDmMjVgQ8L', 'A100', 2000.00, 800.0000, 80.0000, 0.080000, 0.080000, 'EU', 0.1000, TRUE, 11),
('UbB4pD2GeHnImC6YoA0SxKgQjRzN5MdBxPwEnNkWhR9M', 'H100', 700.00, 490.0000, 196.0000, 0.196000, 0.196000, 'US', 0.4000, TRUE, 12),
('VcC5qE3HfIoJnD7ZpB1TyLhRkSaO6NeByQxFoOlXiS0N', 'A100', 2250.00, 900.0000, 360.0000, 0.360000, 0.360000, 'US', 0.4000, TRUE, 13),
('WdD6rF4IgJpKoE8AqC2UzMiSlTbP7OfCzRyGpPmYjT1O', 'V100', 1833.33, 550.0000, 220.0000, 0.220000, 0.220000, 'US', 0.4000, TRUE, 14),
('XeE7sG5JhKqLpF9BrD3VaMjTmUcQ8PgDaShHqQnZkU2P', 'H100', 850.00, 595.0000, 238.0000, 0.238000, 0.238000, 'US', 0.4000, TRUE, 15);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check record counts
SELECT 'carbon_projects' as table_name, COUNT(*) as count FROM carbon_projects
UNION ALL
SELECT 'carbon_credits', COUNT(*) FROM carbon_credits
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'marketplace_listings', COUNT(*) FROM marketplace_listings
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'gpu_emissions_calculations', COUNT(*) FROM gpu_emissions_calculations;

-- ============================================
-- END OF SETUP SCRIPT
-- ============================================