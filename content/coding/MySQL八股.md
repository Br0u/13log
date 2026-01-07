---
title: "MySQL八股"
date: 2026-01-08T00:11:56+08:00
draft: false
tags: ["编程", "技术"]
categories: ["Coding"]
description: "MySQL 面试常见知识点总结"
---

## 一、SQL 查询核心模板

### 1.1 分组聚合查询

**问题：如何查询每个 X 的最大/最新/最小 Y？**

**答案：**

```sql
SELECT X, MAX(Y)  -- 或 MIN(Y)
FROM 表
GROUP BY X;
```

**关键点：**

- 使用 `GROUP BY` 进行分组
- `MAX()` 用于最大值，`MIN()` 用于最小值
- `SELECT` 中的非聚合字段必须出现在 `GROUP BY` 中

**常见场景：**

- 每个部门最高工资
- 每个用户最新订单
- 每个类别最早记录

---

### 1.2 WHERE 与 GROUP BY 的执行顺序

**问题：WHERE 和 GROUP BY 的执行顺序是什么？**

**答案：**

SQL 执行顺序：

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

**关键点：**

- `WHERE` 是**行级过滤**，在分组之前执行
- `HAVING` 是**组级过滤**，在分组之后执行
- 先过滤再分组，性能更好

**示例：**

```sql
-- 正确：先过滤年份，再分组
SELECT department, AVG(salary)
FROM employees
WHERE YEAR(hire_date) = 2023
GROUP BY department;

-- 错误：不能在 WHERE 中使用聚合函数
-- SELECT department, AVG(salary)
-- FROM employees
-- WHERE AVG(salary) > 10000  -- ❌
-- GROUP BY department;

-- 正确：使用 HAVING 过滤分组结果
SELECT department, AVG(salary)
FROM employees
GROUP BY department
HAVING AVG(salary) > 10000;  -- ✅
```

---

### 1.3 去重计数

**问题：如何统计去重后的数量？**

**答案：**

```sql
SELECT COUNT(DISTINCT 字段)
FROM 表
WHERE 条件;
```

**关键点：**

- `COUNT(*)`：统计所有行数（包括 NULL）
- `COUNT(字段)`：统计该字段非 NULL 的行数
- `COUNT(DISTINCT 字段)`：统计该字段去重后的数量

**示例：**

```sql
-- 统计有多少个不同的用户
SELECT COUNT(DISTINCT user_id)
FROM orders;

-- 统计每个类别的不同商品数
SELECT category, COUNT(DISTINCT product_id)
FROM products
GROUP BY category;
```

---

## 二、JOIN 连接查询

### 2.1 LEFT JOIN 的使用场景

**问题：如何查询主表的所有记录，即使关联表没有数据？**

**答案：**

```sql
SELECT 主表.id, COUNT(右表.id) AS count
FROM 主表
LEFT JOIN 右表
ON 主表.id = 右表.foreign_key
GROUP BY 主表.id;
```

**关键点：**

- `LEFT JOIN` 保留左表（主表）的所有记录
- 右表没有匹配数据时，右表字段为 `NULL`
- `COUNT(右表.id)` 会忽略 `NULL`，结果为 0
- `LEFT JOIN` 后面的是**右表**

**示例：**

```sql
-- 查询所有用户及其订单数量（包括没有订单的用户）
SELECT u.user_id, u.username, COUNT(o.order_id) AS order_count
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.username;
```

**JOIN 类型对比：**

| JOIN 类型         | 说明     | 结果                                  |
| ----------------- | -------- | ------------------------------------- |
| `INNER JOIN`      | 内连接   | 只返回两表都有匹配的记录              |
| `LEFT JOIN`       | 左连接   | 返回左表所有记录，右表无匹配则为 NULL |
| `RIGHT JOIN`      | 右连接   | 返回右表所有记录，左表无匹配则为 NULL |
| `FULL OUTER JOIN` | 全外连接 | 返回两表所有记录（MySQL 不支持）      |

---

## 三、索引优化

### 3.1 索引失效场景

**问题：哪些情况下索引会失效？**

**答案：**

**索引生效的情况：**

```sql
-- ✅ 等值查询
WHERE col = 常量

-- ✅ 范围查询
WHERE col > 常量
WHERE col < 常量
WHERE col BETWEEN 值1 AND 值2

-- ✅ LIKE 前缀匹配
WHERE col LIKE 'prefix%'
```

**索引失效的情况：**

```sql
-- ❌ 对索引列进行运算
WHERE col + 1 = 100
WHERE col * 2 = 200

-- ❌ 对索引列使用函数
WHERE YEAR(col) = 2023
WHERE UPPER(col) = 'VALUE'
WHERE CAST(col AS VARCHAR) = 'value'

-- ❌ 使用不等于
WHERE col <> 值
WHERE col != 值

-- ❌ LIKE 后缀匹配
WHERE col LIKE '%suffix'

-- ❌ 使用 OR 连接（除非所有列都有索引）
WHERE col1 = 1 OR col2 = 2
```

**核心原则：**

- **索引列不能被运算**
- **索引列不能被函数包裹**
- **保持索引列的原始形式**

---

### 3.2 索引类型

**问题：MySQL 有哪些索引类型？**

**答案：**

1. **主键索引（PRIMARY KEY）**

   - 唯一且非空
   - 每个表只能有一个
   - 自动创建聚簇索引

2. **唯一索引（UNIQUE）**

   - 保证列值唯一
   - 可以有多个
   - 允许 NULL 值

3. **普通索引（INDEX）**

   - 最基本的索引
   - 无唯一性约束

4. **组合索引（复合索引）**

   - 多个列组合
   - 遵循**最左前缀原则**

5. **全文索引（FULLTEXT）**
   - 用于全文搜索
   - 仅支持 MyISAM 和 InnoDB

---

### 3.3 最左前缀原则

**问题：什么是索引的最左前缀原则？**

**答案：**

对于组合索引 `(a, b, c)`，以下查询可以使用索引：

```sql
-- ✅ 可以使用索引
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3
WHERE a = 1 AND c = 3  -- 只能用到 a 的索引

-- ❌ 不能使用索引
WHERE b = 2
WHERE c = 3
WHERE b = 2 AND c = 3
```

**原理：**

- 索引按照列的顺序建立
- 必须从最左边的列开始匹配
- 跳过中间的列会导致后续列无法使用索引

---

## 四、事务与锁

### 4.1 事务的 ACID 特性

**问题：什么是事务的 ACID 特性？**

**答案：**

1. **原子性（Atomicity）**

   - 事务要么全部成功，要么全部失败
   - 通过 undo log 实现

2. **一致性（Consistency）**

   - 事务前后数据保持一致
   - 不违反约束和规则

3. **隔离性（Isolation）**

   - 并发事务之间相互隔离
   - 通过锁机制实现

4. **持久性（Durability）**
   - 事务提交后数据永久保存
   - 通过 redo log 实现

---

### 4.2 事务隔离级别

**问题：MySQL 有哪些事务隔离级别？**

**答案：**

| 隔离级别             | 脏读 | 不可重复读 | 幻读 | 说明                    |
| -------------------- | ---- | ---------- | ---- | ----------------------- |
| **READ UNCOMMITTED** | ✅   | ✅         | ✅   | 读未提交，最低级别      |
| **READ COMMITTED**   | ❌   | ✅         | ✅   | 读已提交（Oracle 默认） |
| **REPEATABLE READ**  | ❌   | ❌         | ✅   | 可重复读（MySQL 默认）  |
| **SERIALIZABLE**     | ❌   | ❌         | ❌   | 串行化，最高级别        |

**MySQL 默认隔离级别：REPEATABLE READ**

---

## 五、存储引擎

### 5.1 InnoDB vs MyISAM

**问题：InnoDB 和 MyISAM 的区别？**

**答案：**

| 特性         | InnoDB          | MyISAM         |
| ------------ | --------------- | -------------- |
| **事务支持** | ✅ 支持         | ❌ 不支持      |
| **外键**     | ✅ 支持         | ❌ 不支持      |
| **锁粒度**   | 行锁            | 表锁           |
| **崩溃恢复** | ✅ 支持         | ❌ 不支持      |
| **全文索引** | ✅ 支持（5.6+） | ✅ 支持        |
| **性能**     | 写操作较慢      | 读操作较快     |
| **适用场景** | 事务性应用      | 读多写少的应用 |

**MySQL 5.5+ 默认存储引擎：InnoDB**

---

## 六、性能优化

### 6.1 EXPLAIN 执行计划

**问题：如何分析 SQL 查询性能？**

**答案：**

使用 `EXPLAIN` 查看执行计划：

```sql
EXPLAIN SELECT * FROM users WHERE id = 1;
```

**关键字段：**

- **type**：连接类型（性能从好到坏）
  - `system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`
- **key**：使用的索引
- **rows**：扫描的行数
- **Extra**：额外信息
  - `Using index`：覆盖索引
  - `Using filesort`：需要排序
  - `Using temporary`：使用临时表

---

### 6.2 慢查询优化

**问题：如何优化慢查询？**

**答案：**

1. **添加索引**

   - 在 WHERE、JOIN、ORDER BY 的列上添加索引

2. **避免 SELECT \***

   - 只查询需要的字段

3. **使用 LIMIT**

   - 限制返回结果数量

4. **优化 JOIN**

   - 确保 JOIN 字段有索引
   - 小表驱动大表

5. **避免子查询**

   - 使用 JOIN 替代子查询

6. **使用覆盖索引**
   - 索引包含查询所需的所有字段

---

## 七、常见面试题

### 7.1 COUNT(\*) vs COUNT(1) vs COUNT(字段)

**问题：COUNT(\*) 和 COUNT(1) 有什么区别？**

**答案：**

- `COUNT(*)`：统计所有行数，包括 NULL
- `COUNT(1)`：统计所有行数，包括 NULL（性能与 COUNT(\*) 基本相同）
- `COUNT(字段)`：统计该字段非 NULL 的行数

**性能对比：**

- `COUNT(*)` ≈ `COUNT(1)` > `COUNT(字段)`
- 推荐使用 `COUNT(*)`

---

### 7.2 CHAR vs VARCHAR

**问题：CHAR 和 VARCHAR 的区别？**

**答案：**

| 特性         | CHAR                       | VARCHAR                  |
| ------------ | -------------------------- | ------------------------ |
| **长度**     | 固定长度                   | 可变长度                 |
| **存储**     | 固定分配空间               | 按实际长度存储           |
| **性能**     | 查询稍快                   | 存储更灵活               |
| **适用场景** | 固定长度字符串（如身份证） | 可变长度字符串（如姓名） |

---

### 7.3 分页查询优化

**问题：如何优化深分页查询？**

**答案：**

**问题 SQL（慢）：**

```sql
SELECT * FROM users LIMIT 100000, 20;
```

**优化方案：**

1. **使用索引覆盖 + 子查询**

```sql
SELECT * FROM users
WHERE id >= (SELECT id FROM users LIMIT 100000, 1)
LIMIT 20;
```

2. **使用游标分页**

```sql
-- 记录上一页最后一条记录的 id
SELECT * FROM users
WHERE id > last_id
ORDER BY id
LIMIT 20;
```

---

## 参考资料

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- 《高性能 MySQL》
- 《MySQL 技术内幕：InnoDB 存储引擎》
