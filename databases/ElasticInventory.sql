--------------------------------------------------------------------------------
-- Elastic Inventory Database Schema
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS Store (
	_id                   TEXT PRIMARY KEY,
	_type	             TEXT,
	_data		         TEXT,
	_user				 TEXT, 	
	_creationDate		 TEXT,
	CONSTRAINT User_ck_id UNIQUE (_id)
) WITHOUT ROWID;

CREATE INDEX Store_ix_type ON Store (_type);
