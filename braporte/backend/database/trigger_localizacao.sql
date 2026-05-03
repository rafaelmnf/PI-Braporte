-- Script para criar trigger de validação de localização

CREATE OR REPLACE FUNCTION check_location() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
        RAISE EXCEPTION '-2001: A localização é obrigatória para registrar um reporte.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_location_trigger ON geolocalizacao;

CREATE TRIGGER check_location_trigger
BEFORE INSERT OR UPDATE ON geolocalizacao
FOR EACH ROW
EXECUTE FUNCTION check_location();
