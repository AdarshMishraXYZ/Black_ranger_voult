-- BLACK RANGER Identity Vault Database Schema
-- PostgreSQL Migration: 001_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Identities table
CREATE TABLE IF NOT EXISTS identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ranger_id VARCHAR(100) UNIQUE NOT NULL,
    rank VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QR Issuances table
CREATE TABLE IF NOT EXISTS qr_issuances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identity_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
    signature TEXT NOT NULL,
    token TEXT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Verification Logs table
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identity_id UUID REFERENCES identities(id) ON DELETE SET NULL,
    scanned_payload JSONB,
    signature_valid BOOLEAN NOT NULL,
    result VARCHAR(50) NOT NULL, -- 'valid', 'invalid', 'expired', 'revoked'
    device_info JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    geo JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_identities_ranger_id ON identities(ranger_id);
CREATE INDEX IF NOT EXISTS idx_identities_expiry_date ON identities(expiry_date);
CREATE INDEX IF NOT EXISTS idx_qr_issuances_identity_id ON qr_issuances(identity_id);
CREATE INDEX IF NOT EXISTS idx_qr_issuances_token ON qr_issuances(token);
CREATE INDEX IF NOT EXISTS idx_verification_logs_identity_id ON verification_logs(identity_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_result ON verification_logs(result);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_verification_logs_signature_valid ON verification_logs(signature_valid);

-- Add comments for documentation
COMMENT ON TABLE identities IS 'Stores ranger identity information';
COMMENT ON TABLE qr_issuances IS 'Tracks QR code generation and issuance';
COMMENT ON TABLE verification_logs IS 'Logs all QR code verification attempts';
COMMENT ON TABLE admins IS 'Admin user accounts for system access';

