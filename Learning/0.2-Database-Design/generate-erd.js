const { Client } = require('pg');
const fs = require('fs');

// Database connection config
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'learning_db',
  user: 'student',
  password: 'learn123'
};

async function generateERD() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('🔗 Connected to database...');

    // Get all tables with their columns
    const tablesQuery = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN 'PK'
          WHEN fk.column_name IS NOT NULL THEN 'FK'
          WHEN uk.column_name IS NOT NULL THEN 'UK'
          ELSE ''
        END as constraint_type
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN (
        SELECT ku.column_name, ku.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name
      LEFT JOIN (
        SELECT ku.column_name, ku.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
      ) fk ON c.column_name = fk.column_name AND c.table_name = fk.table_name
      LEFT JOIN (
        SELECT ku.column_name, ku.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
      ) uk ON c.column_name = uk.column_name AND c.table_name = uk.table_name
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT LIKE '%_bad_example'
        AND t.table_name NOT LIKE 'perf_test%'
        AND t.table_name NOT LIKE 'audit_log'
        AND t.table_name NOT LIKE 'stock_alerts'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    // Get foreign key relationships
    const relationshipsQuery = `
      SELECT
        tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_name as target_table,
        ccu.column_name as target_column,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name NOT LIKE '%_bad_example'
        AND tc.table_name NOT LIKE 'perf_test%'
        AND tc.table_name NOT LIKE 'audit_log'
        AND tc.table_name NOT LIKE 'stock_alerts'
      ORDER BY tc.table_name;
    `;

    const tablesResult = await client.query(tablesQuery);
    const relationshipsResult = await client.query(relationshipsQuery);

    // Process tables data
    const tables = {};
    tablesResult.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      
      let dataType = row.data_type;
      if (dataType === 'character varying') dataType = 'string';
      if (dataType === 'integer') dataType = 'int';
      if (dataType === 'numeric') dataType = 'decimal';
      if (dataType === 'timestamp without time zone') dataType = 'timestamp';
      if (dataType === 'text') dataType = 'text';
      if (dataType === 'boolean') dataType = 'boolean';
      
      tables[row.table_name].push({
        column: row.column_name,
        type: dataType,
        constraint: row.constraint_type
      });
    });

    // Generate Mermaid ERD
    let mermaid = '```mermaid\nerDiagram\n';
    
    // Add relationships
    const relationships = new Set();
    relationshipsResult.rows.forEach(rel => {
      const sourceTable = rel.source_table.toUpperCase();
      const targetTable = rel.target_table.toUpperCase();
      const relationshipKey = `${targetTable}-${sourceTable}`;
      
      if (!relationships.has(relationshipKey)) {
        // Determine relationship type based on foreign key
        let relationship = '||--o{';
        let label = 'has';
        
        if (rel.source_table === 'orders' && rel.target_table === 'users') {
          label = 'places';
        } else if (rel.source_table === 'reviews' && rel.target_table === 'users') {
          label = 'writes';
        } else if (rel.source_table === 'cart_items' && rel.target_table === 'users') {
          label = 'has';
        } else if (rel.source_table === 'products' && rel.target_table === 'categories') {
          label = 'contains';
        } else if (rel.source_table === 'order_items' && rel.target_table === 'products') {
          label = 'ordered_as';
        } else if (rel.source_table === 'reviews' && rel.target_table === 'products') {
          label = 'receives';
        } else if (rel.source_table === 'cart_items' && rel.target_table === 'products') {
          label = 'added_to_cart';
        } else if (rel.source_table === 'order_items' && rel.target_table === 'orders') {
          label = 'contains';
        }
        
        mermaid += `    ${targetTable} ${relationship} ${sourceTable} : "${label}"\n`;
        relationships.add(relationshipKey);
      }
    });
    
    mermaid += '\n';
    
    // Add table definitions
    Object.entries(tables).forEach(([tableName, columns]) => {
      const upperTableName = tableName.toUpperCase();
      mermaid += `    ${upperTableName} {\n`;
      
      columns.forEach(col => {
        const constraint = col.constraint ? ` ${col.constraint}` : '';
        mermaid += `        ${col.type} ${col.column}${constraint}\n`;
      });
      
      mermaid += '    }\n\n';
    });
    
    mermaid += '```';

    // Save to file
    const outputPath = './schemas/generated-erd.md';
    const content = `# 🔄 Auto-Generated Database ERD

> Generated on: ${new Date().toISOString()}
> Database: learning_db

## Current Database Schema

${mermaid}

## 📊 Database Statistics

- **Tables**: ${Object.keys(tables).length}
- **Total Columns**: ${Object.values(tables).reduce((sum, cols) => sum + cols.length, 0)}
- **Relationships**: ${relationshipsResult.rows.length}

## 🔄 How to Regenerate

To update this ERD after schema changes:

\`\`\`bash
cd Learning/0.2-Database-Design
node generate-erd.js
\`\`\`

---
*This ERD was automatically generated from your PostgreSQL database schema.*
`;

    fs.writeFileSync(outputPath, content);
    console.log(`✅ ERD generated successfully!`);
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`\n🔍 Preview the first few lines:`);
    console.log(content.substring(0, 500) + '...');

  } catch (error) {
    console.error('❌ Error generating ERD:', error.message);
  } finally {
    await client.end();
  }
}

// Run the script
generateERD(); 