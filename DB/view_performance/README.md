# PostgreSQL View层性能优化：正则提取 vs 直接存储ID

## 背景

在实际业务开发中，我们经常遇到这样的场景：某个字段包含复合信息（如 `ORDER_12345_USER_6789`），需要从中提取某个部分（如订单ID `12345`）用于查询和统计。

这时候有两种常见方案：
- **方案A**：在 View 层使用正则表达式动态提取
- **方案B**：在表中直接存储提取后的ID，View 直接读取

本文通过一个 100 万数据量的实际测试，对比这两种方案的性能差异。

## 测试环境

- **数据库**：PostgreSQL 12+
- **工具**：DBeaver
- **数据量**：100 万条记录
- **测试方式**：同一个表，通过不同的 View 进行对比

## 方案设计

### 表结构

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_info VARCHAR(255),      -- 完整的订单信息字符串 (如：ORDER_12345_USER_6789)
    order_id INTEGER,              -- 预先提取的ID（方案B使用）
    amount NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为 order_id 创建索引
CREATE INDEX idx_order_id ON orders(order_id);
```

### 方案A：View中使用正则表达式

```sql
CREATE OR REPLACE VIEW v_orders_with_regex AS
SELECT 
    id,
    order_info,
    (regexp_match(order_info, '[0-9]+'))[1]::INTEGER AS extracted_id,  -- 运行时提取
    amount,
    created_at
FROM orders;
```

**特点**：
- 不占用额外存储空间
- 每次查询时都需要执行正则表达式
- 无法使用索引优化

### 方案B：View中直接读取预存的ID

```sql
CREATE OR REPLACE VIEW v_orders_with_direct_id AS
SELECT 
    id,
    order_info,
    order_id AS extracted_id,  -- 直接读取
    amount,
    created_at
FROM orders;
```

**特点**：
- 需要额外的存储空间（一个 INTEGER 字段）
- 查询时直接读取，无需计算
- 可以使用索引进行优化

## 测试数据

插入 100 万条测试数据：

```sql
INSERT INTO orders (order_info, order_id, amount)
SELECT 
    'ORDER_' || i || '_USER_' || (i % 10000),  -- 生成订单信息字符串
    i,                                          -- 同时存储提取后的ID
    ROUND((RANDOM() * 1000)::NUMERIC, 2)
FROM generate_series(1, 1000000) AS i;
```

## 性能测试

### 测试1：单次查询对比

查询条件：`extracted_id BETWEEN 100000 AND 200000`（约10万条数据）

```sql
CREATE OR REPLACE FUNCTION performance_comparison_test()
RETURNS TABLE(
    method TEXT,
    record_count BIGINT,
    avg_amount NUMERIC,
    sum_amount NUMERIC,
    execution_time_ms NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    result_count BIGINT;
    result_avg NUMERIC;
    result_sum NUMERIC;
BEGIN
    -- 测试方案A：使用正则表达式
    start_time := clock_timestamp();
    
    SELECT COUNT(*), AVG(amount), SUM(amount) 
    INTO result_count, result_avg, result_sum
    FROM v_orders_with_regex
    WHERE extracted_id BETWEEN 100000 AND 200000;
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        '方案A：正则提取ID'::TEXT,
        result_count,
        ROUND(result_avg, 2),
        ROUND(result_sum, 2),
        ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000, 2);
    
    -- 测试方案B：直接读取ID
    start_time := clock_timestamp();
    
    SELECT COUNT(*), AVG(amount), SUM(amount) 
    INTO result_count, result_avg, result_sum
    FROM v_orders_with_direct_id
    WHERE extracted_id BETWEEN 100000 AND 200000;
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        '方案B：直接读取ID'::TEXT,
        result_count,
        ROUND(result_avg, 2),
        ROUND(result_sum, 2),
        ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000, 2);
END;
$$;

-- 执行测试
SELECT * FROM performance_comparison_test();
```

**测试结果示例**：

| method | record_count | avg_amount | sum_amount | execution_time_ms |
|--------|--------------|------------|------------|-------------------|
| 方案A：正则提取ID | 100001 | 499.85 | 49985432.10 | **3245.67** |
| 方案B：直接读取ID | 100001 | 499.85 | 49985432.10 | **45.23** |

🚀 **性能差异：方案B 比方案A 快 ~71 倍！**

### 测试2：多轮压力测试

进行 10 轮不同范围的查询测试：

```sql
SELECT * FROM benchmark_comparison();
```

**测试结果示例**：

| summary | test_rounds | regex_total_ms | direct_total_ms | regex_avg_ms | direct_avg_ms | speed_improvement |
|---------|-------------|----------------|-----------------|--------------|---------------|-------------------|
| ━━━━━ 性能对比结果 ━━━━━ | 10 | 28543.21 | 412.35 | 2854.32 | 41.24 | **69.2x 慢** |

### 测试3：不同数据范围的详细分析

```sql
SELECT * FROM detailed_performance_analysis();
```

**测试结果示例**：

| test_case | query_type | rows_returned | execution_time_ms | uses_index |
|-----------|------------|---------------|-------------------|------------|
| 小范围(1000行) | 正则提取 | 1001 | 2987.45 | 否(全表扫描) |
| 小范围(1000行) | 直接读取 | 1001 | 2.13 | 是(索引扫描) |
| 中等范围(50000行) | 正则提取 | 50001 | 3124.78 | 否(全表扫描) |
| 中等范围(50000行) | 直接读取 | 50001 | 18.56 | 是(索引扫描) |
| 大范围(200000行) | 正则提取 | 200001 | 3456.92 | 否(全表扫描) |
| 大范围(200000行) | 直接读取 | 200001 | 67.34 | 是(索引扫描) |

### 执行计划对比

#### 方案A（正则表达式）

```sql
EXPLAIN (ANALYZE, BUFFERS, TIMING, VERBOSE)
SELECT extracted_id, amount
FROM v_orders_with_regex
WHERE extracted_id BETWEEN 100000 AND 200000
LIMIT 100;
```

**关键信息**：
- Seq Scan（顺序扫描）全表
- 需要对每一行执行正则表达式
- 无法使用索引

#### 方案B（直接读取）

```sql
EXPLAIN (ANALYZE, BUFFERS, TIMING, VERBOSE)
SELECT extracted_id, amount
FROM v_orders_with_direct_id
WHERE extracted_id BETWEEN 100000 AND 200000
LIMIT 100;
```

**关键信息**：
- Index Scan（索引扫描）
- 直接通过索引定位数据
- 高效的范围查询

## 性能分析总结

### 为什么方案B快这么多？

1. **索引使用**
   - 方案A：正则表达式是运行时计算，无法建立索引，必须全表扫描
   - 方案B：预存储的 `order_id` 有索引，可以快速定位

2. **计算成本**
   - 方案A：每次查询都要对每一行执行正则匹配和类型转换
   - 方案B：直接读取已存储的值，无需任何计算

3. **扫描方式**
   - 方案A：Seq Scan（顺序扫描）100万行
   - 方案B：Index Scan（索引扫描）只访问需要的行

### 空间与时间的权衡

**方案A 的优势**：
- ✅ 不占用额外存储空间
- ✅ 数据一致性好（从源字段动态提取）

**方案A 的劣势**：
- ❌ 查询性能差（60-70倍慢）
- ❌ CPU 密集型操作
- ❌ 无法使用索引

**方案B 的优势**：
- ✅ 查询性能极佳
- ✅ 可使用索引优化
- ✅ CPU 消耗低

**方案B 的劣势**：
- ❌ 需要额外存储空间（每行 4 字节）
- ❌ 需要维护数据一致性

**存储成本分析**：
- 100 万行数据，额外的 INTEGER 字段约占用 **4MB**（加上索引约 **10MB**）
- 对于现代服务器，这点空间成本几乎可以忽略

## 最佳实践建议

### 什么时候用方案A（正则提取）？

- 数据量非常小（< 1000 行）
- 查询频率很低（偶尔查询）
- 存储空间极度受限
- 源字段会频繁变化

### 什么时候用方案B（直接存储）？

- 数据量大（> 10万行）✅
- 查询频率高 ✅
- 需要范围查询或排序 ✅
- 对查询性能有要求 ✅

### 实施建议

如果选择方案B，建议：

1. **使用触发器维护一致性**：

```sql
CREATE OR REPLACE FUNCTION update_order_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_id := (regexp_match(NEW.order_info, '[0-9]+'))[1]::INTEGER;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_id
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_id();
```

2. **创建必要的索引**：

```sql
CREATE INDEX idx_order_id ON orders(order_id);
```

3. **定期检查数据一致性**：

```sql
-- 检查是否有不一致的数据
SELECT COUNT(*) 
FROM orders 
WHERE order_id != (regexp_match(order_info, '[0-9]+'))[1]::INTEGER;
```

## 结论

在大数据量场景下，**方案B（直接存储ID）比方案A（正则提取）快 60-70 倍**，而额外的存储成本几乎可以忽略（100万行仅需约10MB）。

**核心原则**：
> 💡 用空间换时间是数据库优化的经典策略。在查询频繁的场景下，预计算和存储中间结果，比运行时动态计算要高效得多。

**推荐方案**：
- 对于生产环境的高频查询场景，强烈推荐使用 **方案B**
- 配合触发器和索引，既保证性能，又维护数据一致性

## 完整测试代码

完整的测试 SQL 代码请参考：[index.sql](index.sql)

## 扩展阅读

- [PostgreSQL 索引优化指南](https://www.postgresql.org/docs/current/indexes.html)
- [正则表达式性能优化](https://www.postgresql.org/docs/current/functions-matching.html)
- [触发器最佳实践](https://www.postgresql.org/docs/current/triggers.html)

---

**测试日期**：2026-01-14  
**数据库版本**：PostgreSQL 12+  
**测试工具**：DBeaver