---
title: "全栈面试八股"
date: 2026-01-08T00:11:56+08:00
draft: false
tags: ["编程", "技术"]
categories: ["Coding"]
description: "全栈面试八股"
---

# SQL 执行顺序

## 一、模板（Template）

```
FROM → JOIN/ON → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

**记忆口诀**：先连接，再过滤，后分组，最后排序

## 二、例子（Example）

```sql
SELECT department, AVG(salary) AS avg_sal
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE e.hire_date > '2020-01-01'
GROUP BY department
HAVING AVG(salary) > 10000
ORDER BY avg_sal DESC
LIMIT 10;
```

**执行过程**：

1. FROM employees → 从 employees 表开始
2. LEFT JOIN departments ON ... → 连接 departments 表
3. WHERE hire_date > '2020-01-01' → 过滤行
4. GROUP BY department → 按部门分组
5. HAVING AVG(salary) > 10000 → 过滤组
6. SELECT department, AVG(salary) → 选择字段
7. ORDER BY avg_sal DESC → 排序
8. LIMIT 10 → 限制数量

## 三、例题（Question）

**判断题**：以下 SQL 中，WHERE 和 HAVING 的执行顺序是否正确？

```sql
SELECT department, COUNT(*) AS cnt
FROM employees
WHERE salary > 5000
GROUP BY department
HAVING COUNT(*) > 10
ORDER BY cnt DESC;
```

A. 正确  
B. 错误

## 四、答案（Answer）

**A. 正确**

WHERE 在 GROUP BY 之前执行（行级过滤），HAVING 在 GROUP BY 之后执行（组级过滤）

## 五、解释（Explanation）

**执行步骤拆解**：

1. **FROM employees** → 读取 employees 表的所有数据行
2. **WHERE salary > 5000** → 对每一行进行过滤，只保留 salary > 5000 的行（此时还未分组）
3. **GROUP BY department** → 将过滤后的行按 department 分组，相同 department 的行合并成一组
4. **HAVING COUNT(\*) > 10** → 对每个组进行过滤，只保留组内行数 > 10 的组（此时已经分组完成）
5. **SELECT department, COUNT(\*) AS cnt** → 从保留的组中选择字段，COUNT(\*) 对每个组计算行数
6. **ORDER BY cnt DESC** → 按 cnt 排序
7. **LIMIT** → 限制结果数量

**为什么 WHERE 不能使用聚合函数？**

- WHERE 执行时还没有分组，此时数据还是**一行一行的原始数据**
- COUNT(\*)、AVG() 等聚合函数需要**一组数据**才能计算
- 所以 WHERE 中不能写 `WHERE COUNT(*) > 10`（报错：聚合函数不能在 WHERE 中使用）

**为什么 HAVING 必须使用聚合函数？**

- HAVING 执行时已经分组完成，数据已经变成**一组一组的**
- HAVING 要过滤的是"组"，需要用聚合函数判断组的属性
- 所以 HAVING 中写 `HAVING COUNT(*) > 10`（正确：对组进行过滤）

---

# WHERE vs HAVING

## 一、模板（Template）

- **WHERE**：行级过滤，分组前执行，**不能用聚合函数**
- **HAVING**：组级过滤，分组后执行，**必须用聚合函数**

**判断口诀**：看到 COUNT/SUM/AVG → 用 HAVING

## 二、例子（Example）

```sql
-- 查询平均工资超过 10000 的部门（只统计 2020 年后入职的员工）
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'    -- 行级过滤：先过滤员工
GROUP BY department
HAVING AVG(salary) > 10000;        -- 组级过滤：再过滤部门
```

**查询结果示例**：

```
department | avg_salary
-----------|-----------
研发部     | 15000
销售部     | 12000
```

**执行过程**：

1. WHERE → 只保留 2020 年后入职的员工行
2. GROUP BY → 按部门分组
3. HAVING → 只保留平均工资 > 10000 的组

## 三、例题（Question）

**选择题**：以下哪个 SQL 语句是正确的？

A.

```sql
SELECT department, AVG(salary)
FROM employees
WHERE AVG(salary) > 10000
GROUP BY department;
```

B.

```sql
SELECT department, AVG(salary)
FROM employees
GROUP BY department
HAVING AVG(salary) > 10000;
```

C. 两个都正确

D. 两个都不正确

## 四、答案（Answer）

**B**

## 五、解释（Explanation）

**A 为什么错误？**

- WHERE 在 GROUP BY **之前**执行，此时数据还是**一行一行**的原始数据
- `AVG(salary)` 需要**一组数据**才能计算平均值
- WHERE 执行时还没有分组，无法计算 AVG，所以报错：`Invalid use of group function`

**执行过程对比**：

**A 的错误执行流程**：

```
1. FROM employees → 读取所有员工行
2. WHERE AVG(salary) > 10000 → ❌ 报错！此时还没有分组，无法计算 AVG
```

**B 的正确执行流程**：

```
1. FROM employees → 读取所有员工行
2. GROUP BY department → 按部门分组，现在数据是一组一组的
3. HAVING AVG(salary) > 10000 → ✅ 正确！对每个组计算 AVG，然后过滤
```

**底层模型**：

- SQL 执行可以理解为**流水线处理**
- WHERE 是**过滤流水线上的单件产品**（单行数据）
- GROUP BY 是**将产品打包成箱**（将行打包成组）
- HAVING 是**过滤箱子**（过滤组）
- 你不能在"过滤单件产品"时判断"整箱产品的平均值"（逻辑错误）

---

# COUNT(\*) vs COUNT(col)

## 一、模板（Template）

- `COUNT(*)`：统计**所有行数**（包括 NULL 行）
- `COUNT(col)`：统计 **col 非 NULL 的行数**（不包括 NULL）
- `COUNT(DISTINCT col)`：统计 **col 去重后的非 NULL 数量**

**记忆**：COUNT(\*) = 数行数，COUNT(col) = 数非 NULL 值

## 二、例子（Example）

```sql
-- 假设 employees 表有 100 行数据
-- 其中 10 行的 email 为 NULL，20 行的 phone 为 NULL

SELECT
    COUNT(*) AS total,                    -- 100（所有行）
    COUNT(email) AS with_email,           -- 90（非 NULL 行）
    COUNT(phone) AS with_phone,           -- 80（非 NULL 行）
    COUNT(DISTINCT email) AS unique_email -- 85（假设 90 个非 NULL 中有 5 个重复）
FROM employees;
```

**查询结果**：

```
total | with_email | with_phone | unique_email
------|------------|------------|-------------
100   | 90         | 80         | 85
```

## 三、例题（Question）

**选择题**：假设 users 表有 1000 行数据，其中 100 行的 email 为 NULL。执行以下查询，结果是多少？

```sql
SELECT COUNT(*) FROM users;        -- ①
SELECT COUNT(email) FROM users;    -- ②
```

A. ① = 1000, ② = 900  
B. ① = 900, ② = 1000  
C. ① = 1000, ② = 1000  
D. ① = 900, ② = 900

## 四、答案（Answer）

**A. ① = 1000, ② = 900**

## 五、解释（Explanation）

**执行过程拆解**：

**① COUNT(\*) 的执行**：

```
1. 遍历 users 表的每一行（共 1000 行）
2. 不管这一行的任何字段是否为 NULL，都计数 +1
3. 结果：1000
```

**② COUNT(email) 的执行**：

```
1. 遍历 users 表的每一行（共 1000 行）
2. 检查 email 字段：
   - 如果 email IS NOT NULL → 计数 +1
   - 如果 email IS NULL → 跳过（不计数）
3. 结果：1000 - 100 = 900
```

**底层实现差异**：

- `COUNT(*)`：只需要数**行数**，不检查字段值，性能最快
- `COUNT(col)`：需要检查**字段是否为 NULL**，再计数，性能稍慢
- `COUNT(DISTINCT col)`：需要先去重，再检查 NULL，最后计数，性能最慢

**在 LEFT JOIN 中的应用**：

```sql
SELECT u.id, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

**为什么用 COUNT(o.id) 而不是 COUNT(\*)？**

- 用户没有订单时，LEFT JOIN 后 o.id 为 NULL
- `COUNT(o.id)` 会忽略 NULL，结果为 0（正确）
- `COUNT(*)` 会计算行数，结果为 1（错误：用户没有订单却显示 1）

**执行示例**：

```
users 表：        orders 表：
id | name        id | user_id
1  | Alice       1  | 1
2  | Bob         2  | 1
                 （user_id=2 没有订单）

LEFT JOIN 后：
u.id | u.name | o.id
1    | Alice  | 1
1    | Alice  | 2
2    | Bob    | NULL

GROUP BY + COUNT 后：
u.id | order_count (COUNT(o.id))
1    | 2
2    | 0  ← 如果写 COUNT(*)，这里会显示 1（错误）
```

---

# GROUP BY 分组查询

## 一、模板（Template）

```sql
-- 每个 X 的最大/最新/最小 Y
SELECT X, MAX(Y)  -- 或 MIN(Y)
FROM 表
GROUP BY X;
```

**关键词触发**："每个"、"各组"、"按...分组" → 用 GROUP BY

## 二、例子（Example）

```sql
-- 查询每个部门的最高工资
SELECT department, MAX(salary) AS max_salary
FROM employees
GROUP BY department;
```

**数据示例**：

```
employees 表：
id | name   | department | salary
1  | Alice  | 研发部     | 15000
2  | Bob    | 研发部     | 18000
3  | Charlie| 销售部     | 12000
4  | David  | 销售部     | 10000
```

**查询结果**：

```
department | max_salary
-----------|-----------
研发部     | 18000
销售部     | 12000
```

**执行过程**：

1. 按 department 分组：研发部组（2 行）、销售部组（2 行）
2. 对每组计算 MAX(salary)：研发部组取 18000，销售部组取 12000

## 三、例题（Question）

**SQL 填空**：查询每个用户的最新订单时间

```sql
SELECT user_id, ______(order_time) AS latest_time
FROM orders
______ BY user_id;
```

A. MAX, GROUP  
B. MIN, GROUP  
C. MAX, ORDER  
D. MIN, ORDER

## 四、答案（Answer）

**A. MAX, GROUP**

完整 SQL：

```sql
SELECT user_id, MAX(order_time) AS latest_time
FROM orders
GROUP BY user_id;
```

## 五、解释（Explanation）

**为什么用 MAX？**

- "最新"订单时间 = 时间最大的（时间越晚数值越大）
- 所以用 `MAX(order_time)` 获取每个组的最大时间值

**为什么用 GROUP BY？**

- "每个用户" → 需要按 user_id 分组
- 分组后才能对每个组分别计算 MAX

**执行步骤拆解**：

假设 orders 表数据：

```
id | user_id | order_time
1  | 1       | 2024-01-01
2  | 1       | 2024-01-15  ← user_id=1 的最新订单
3  | 2       | 2024-01-10
4  | 2       | 2024-01-20  ← user_id=2 的最新订单
```

**执行过程**：

```
1. FROM orders → 读取所有订单行
2. GROUP BY user_id → 将行按 user_id 分组
   - user_id=1 组：[行1, 行2]
   - user_id=2 组：[行3, 行4]
3. SELECT user_id, MAX(order_time) → 对每组计算 MAX(order_time)
   - user_id=1 组：MAX(2024-01-01, 2024-01-15) = 2024-01-15
   - user_id=2 组：MAX(2024-01-10, 2024-01-20) = 2024-01-20
```

**规则**：SELECT 中的非聚合字段必须出现在 GROUP BY 中

- ✅ 正确：`SELECT user_id, MAX(order_time) GROUP BY user_id`（user_id 在 GROUP BY 中）
- ❌ 错误：`SELECT user_id, name, MAX(order_time) GROUP BY user_id`（name 不在 GROUP BY 中）

---

# LEFT JOIN

## 一、模板（Template）

```sql
SELECT 主表.id, COUNT(右表.id) AS count
FROM 主表
LEFT JOIN 右表 ON 主表.id = 右表.foreign_key
GROUP BY 主表.id;
```

**核心结论**：

- 左表全保留，右表无匹配 → NULL
- COUNT(右表.id) → 0（COUNT 忽略 NULL）

**记忆**：LEFT JOIN 后面的是右表

## 二、例子（Example）

```sql
-- 查询所有用户及其订单数量（包括没有订单的用户）
SELECT u.id, u.username, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

**数据示例**：

```
users 表：          orders 表：
id | username      id | user_id | amount
1  | Alice         1  | 1       | 100
2  | Bob           2  | 1       | 200
3  | Charlie       （user_id=2,3 没有订单）
```

**LEFT JOIN 后的中间结果**：

```
u.id | u.username | o.id | o.amount
1    | Alice      | 1    | 100
1    | Alice      | 2    | 200
2    | Bob        | NULL | NULL      ← 左表保留，右表为 NULL
3    | Charlie    | NULL | NULL      ← 左表保留，右表为 NULL
```

**GROUP BY + COUNT 后的最终结果**：

```
u.id | username | order_count
1    | Alice    | 2
2    | Bob      | 0  ← COUNT(o.id) 忽略 NULL，结果为 0
3    | Charlie  | 0
```

## 三、例题（Question）

**判断题**：以下 SQL 能正确查询所有用户及其订单数量（包括没有订单的用户）吗？

```sql
SELECT u.id, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

A. 能  
B. 不能

## 四、答案（Answer）

**A. 能**

## 五、解释（Explanation）

**执行步骤拆解**：

**步骤 1：FROM users u**

```
读取 users 表的所有行：
u.id | u.username
1    | Alice
2    | Bob
3    | Charlie
```

**步骤 2：LEFT JOIN orders o ON u.id = o.user_id**

```
对左表的每一行，在右表中查找匹配：

左表行 1 (u.id=1)：
  - 在右表中查找 o.user_id=1 → 找到 2 行（o.id=1, o.id=2）
  - 连接结果：2 行（Alice 连接了 2 个订单）

左表行 2 (u.id=2)：
  - 在右表中查找 o.user_id=2 → 没找到
  - 连接结果：1 行（Bob 连接了 NULL，因为 LEFT JOIN 保留左表）

左表行 3 (u.id=3)：
  - 在右表中查找 o.user_id=3 → 没找到
  - 连接结果：1 行（Charlie 连接了 NULL）

中间结果（共 4 行）：
u.id | u.username | o.id | o.amount
1    | Alice      | 1    | 100
1    | Alice      | 2    | 200
2    | Bob        | NULL | NULL
3    | Charlie    | NULL | NULL
```

**步骤 3：GROUP BY u.id**

```
按 u.id 分组：
- 组 1 (u.id=1)：包含 2 行（Alice 的 2 个订单）
- 组 2 (u.id=2)：包含 1 行（Bob，o.id 为 NULL）
- 组 3 (u.id=3)：包含 1 行（Charlie，o.id 为 NULL）
```

**步骤 4：SELECT u.id, COUNT(o.id)**

```
对每组计算 COUNT(o.id)：
- 组 1：COUNT(1, 2) = 2（2 个非 NULL 值）
- 组 2：COUNT(NULL) = 0（COUNT 忽略 NULL）
- 组 3：COUNT(NULL) = 0

最终结果：
u.id | order_count
1    | 2
2    | 0  ← 正确：用户没有订单显示 0
3    | 0
```

**为什么 COUNT(o.id) 能正确处理 NULL？**

- COUNT(col) 的内部逻辑：遍历组内的每一行，只计数 col 非 NULL 的行
- 组 2 中只有 1 行，且 o.id 为 NULL，所以计数为 0
- 如果用 COUNT(\*)，会计算行数，结果为 1（错误）

**LEFT JOIN 的核心机制**：

- LEFT JOIN 保证**左表的所有行都会出现在结果中**
- 右表没有匹配时，右表的所有字段都为 NULL
- 这是 LEFT JOIN 与 INNER JOIN 的本质区别

---

# LEFT JOIN + WHERE 陷阱

## 一、模板（Template）

```sql
-- ❌ 错误：条件在 WHERE 中（会把 NULL 过滤掉）
SELECT ...
FROM A
LEFT JOIN B ON A.id = B.a_id
WHERE B.col = x;  -- LEFT JOIN 失效！

-- ✅ 正确：条件在 ON 中
SELECT ...
FROM A
LEFT JOIN B ON A.id = B.a_id
AND B.col = x;  -- 保持 LEFT JOIN 特性
```

**记忆口诀**：LEFT JOIN 要保留左表 → 条件放 **ON**，不要放 WHERE

## 二、例子（Example）

```sql
-- ❌ 错误写法
SELECT u.id, COUNT(o.id) AS order_count_2024
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE YEAR(o.order_time) = 2024  -- 这会把没有订单的用户过滤掉！
GROUP BY u.id;

-- ✅ 正确写法
SELECT u.id, COUNT(o.id) AS order_count_2024
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
AND YEAR(o.order_time) = 2024  -- 条件在 ON 中
GROUP BY u.id;
```

**数据示例**：

```
users 表：          orders 表：
id | username      id | user_id | order_time
1  | Alice         1  | 1       | 2024-01-15
2  | Bob           2  | 1       | 2023-01-10  ← 2023 年的订单
3  | Charlie       （user_id=2,3 没有订单）
```

**错误写法的执行结果**：

```
u.id | username | order_count_2024
1    | Alice    | 1
（用户 2 和 3 被过滤掉了，因为 WHERE o.order_time IS NULL 为 false）
```

**正确写法的执行结果**：

```
u.id | username | order_count_2024
1    | Alice    | 1
2    | Bob      | 0  ← 保留了用户，显示 0
3    | Charlie  | 0  ← 保留了用户，显示 0
```

## 三、例题（Question）

**判断题**：以下两个 SQL 的查询结果是否相同？

**SQL 1**：

```sql
SELECT u.id, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'paid'
GROUP BY u.id;
```

**SQL 2**：

```sql
SELECT u.id, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
AND o.status = 'paid'
GROUP BY u.id;
```

A. 相同  
B. 不同

## 四、答案（Answer）

**B. 不同**

SQL 1 会过滤掉没有订单或订单状态不是 'paid' 的用户  
SQL 2 会保留所有用户，只统计状态为 'paid' 的订单数

## 五、解释（Explanation）

**执行步骤对比**：

**SQL 1 的执行过程（错误）**：

```
步骤 1：FROM users u → 读取 3 个用户
步骤 2：LEFT JOIN orders o ON u.id = o.user_id
  - user_id=1 → 连接了 2 个订单（status='paid', status='unpaid'）
  - user_id=2 → 连接了 NULL（没有订单）
  - user_id=3 → 连接了 NULL（没有订单）

中间结果：
u.id | o.id | o.status
1    | 1    | 'paid'
1    | 2    | 'unpaid'
2    | NULL | NULL      ← LEFT JOIN 保留
3    | NULL | NULL      ← LEFT JOIN 保留

步骤 3：WHERE o.status = 'paid'
  - 第 1 行：o.status='paid' → 保留 ✅
  - 第 2 行：o.status='unpaid' → 过滤 ❌
  - 第 3 行：o.status IS NULL → 过滤 ❌（NULL = 'paid' 为 false）
  - 第 4 行：o.status IS NULL → 过滤 ❌

过滤后只剩 1 行：
u.id | o.id | o.status
1    | 1    | 'paid'

步骤 4：GROUP BY u.id, COUNT(o.id)
  - 结果：u.id=1, count=1
  - 用户 2 和 3 被过滤掉了！
```

**SQL 2 的执行过程（正确）**：

```
步骤 1：FROM users u → 读取 3 个用户
步骤 2：LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'paid'
  - 连接条件包含两个：u.id = o.user_id 且 o.status = 'paid'
  - user_id=1 → 只在右表中查找 user_id=1 且 status='paid' 的订单 → 找到 1 个
  - user_id=2 → 查找 user_id=2 且 status='paid' → 没找到 → 连接 NULL
  - user_id=3 → 查找 user_id=3 且 status='paid' → 没找到 → 连接 NULL

中间结果（LEFT JOIN 保留左表所有行）：
u.id | o.id | o.status
1    | 1    | 'paid'
2    | NULL | NULL      ← LEFT JOIN 保留（连接时没找到匹配）
3    | NULL | NULL      ← LEFT JOIN 保留（连接时没找到匹配）

步骤 3：GROUP BY u.id, COUNT(o.id)
  - user_id=1：COUNT(1) = 1
  - user_id=2：COUNT(NULL) = 0
  - user_id=3：COUNT(NULL) = 0

最终结果：
u.id | count
1    | 1
2    | 0  ← 保留了用户
3    | 0  ← 保留了用户
```

**关键差异**：

**WHERE 的执行时机**：

- WHERE 在 LEFT JOIN **之后**执行
- WHERE 会将 `o.status IS NULL` 的行过滤掉（因为 NULL = 'paid' 为 false）
- 这导致 LEFT JOIN 的"保留左表所有行"特性失效

**ON 的执行时机**：

- ON 在 LEFT JOIN **连接时**执行
- 连接时就过滤右表，但**左表的行仍然保留**
- 即使右表没找到匹配，左表行也会出现在结果中（右表字段为 NULL）

**底层模型**：

- **ON 条件**：决定"是否连接"，是连接的一部分
- **WHERE 条件**：决定"是否保留"，是连接后的过滤
- LEFT JOIN 的核心是"保留左表"，所以过滤条件应该放在 ON 中

**记忆技巧**：

- 想保留左表所有行 → 条件放 **ON**
- 想过滤最终结果 → 条件放 **WHERE**

---

# 索引是否生效判断

## 一、模板（Template）

**能用索引**：

- `col = 常量`
- `col > 常量`（范围查询）
- `col BETWEEN 值1 AND 值2`
- `col LIKE 'prefix%'`（前缀匹配）

**不能用索引**：

- `col + 1 = 常量`（对列运算）
- `YEAR(col) = 常量`（对列使用函数）
- `CAST(col AS ...)`（类型转换）
- `col <> 常量`（不等于）
- `col LIKE '%suffix'`（后缀匹配）

**核心原则**：索引列必须保持原始形式，不能运算、不能函数包裹

## 二、例子（Example）

```sql
-- 假设 created_at 字段有索引

-- ✅ 能用索引：范围查询
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ❌ 不能用索引：使用函数
SELECT * FROM orders
WHERE YEAR(created_at) = 2024;
```

**性能对比**（假设 orders 表有 1000 万条数据）：

```
能用索引的查询：~50 毫秒（索引扫描）
不能用索引的查询：~3 秒（全表扫描）
```

## 三、例题（Question）

**选择题**：以下哪个 WHERE 条件可以使用 created_at 字段的索引？

A. `WHERE YEAR(created_at) = 2024`  
B. `WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'`  
C. `WHERE created_at + 1 = '2025-01-01'`  
D. `WHERE MONTH(created_at) = 1`

## 四、答案（Answer）

**B**

## 五、解释（Explanation）

**为什么 B 能用索引？**

**索引的工作机制**：

```
1. 索引是一个有序的数据结构（B+树）
2. 索引存储的是列的原始值
3. 查询时，可以直接在索引中查找值的范围

created_at >= '2024-01-01' AND created_at < '2025-01-01' 的执行：
1. 在索引中找到 >= '2024-01-01' 的第一个位置
2. 从该位置开始向后扫描，直到 >= '2025-01-01' 的位置停止
3. 返回匹配的所有记录
```

**为什么 A、C、D 不能用索引？**

**A. YEAR(created_at) = 2024 的执行过程**：

```
1. 遍历表中的每一行
2. 对每一行的 created_at 字段执行 YEAR() 函数
3. 将函数结果与 2024 比较
4. 匹配则返回该行

问题：
- 索引存储的是 created_at 的原始值（如 '2024-03-15'）
- 但查询需要的是 YEAR(created_at) 的值（如 2024）
- 索引无法直接匹配函数结果，所以无法使用索引
```

**底层模型**：

```
索引结构（B+树）：
        2024-01-15
       /           \
  2023-12-01    2024-06-20
  /     \        /        \
...     ...    ...        ...

当查询 YEAR(created_at) = 2024 时：
- 索引中的值是 '2024-01-15'、'2024-06-20' 等
- 但我们需要的是 YEAR('2024-01-15') = 2024
- 需要对每个索引值计算函数，无法直接利用索引的有序性
```

**C. created_at + 1 = '2025-01-01' 的执行过程**：

```
1. 遍历表中的每一行
2. 对每一行的 created_at 执行 +1 运算
3. 将运算结果与 '2025-01-01' 比较

问题：
- 索引存储的是 created_at 的原始值
- 但查询需要对值进行运算
- 无法在索引中直接查找运算后的值
```

**优化技巧**：

```sql
-- ❌ 不能使用索引
WHERE YEAR(created_at) = 2024;

-- ✅ 可以使用的等价写法
WHERE created_at >= '2024-01-01'
AND created_at < '2025-01-01';
```

**为什么 LIKE 'prefix%' 能用索引，LIKE '%suffix' 不能用？**

**LIKE 'prefix%' 的执行**：

```
1. 在索引中找到以 'prefix' 开头的第一个位置
2. 从该位置开始向后扫描，直到不以 'prefix' 开头的位置停止
3. 利用索引的有序性，可以快速定位范围

例如：LIKE 'abc%'
索引：abc123, abc456, abc789, xyz123
      ↑________________↑
      可以快速定位这个范围
```

**LIKE '%suffix' 的执行**：

```
1. 需要检查每一行是否以 'suffix' 结尾
2. 无法利用索引的有序性（索引是按前缀排序的）
3. 必须全表扫描

例如：LIKE '%xyz'
索引：abc123, abc456, abc789, xyz123
      无法利用索引，因为后缀匹配与索引的有序性无关
```

**为什么 <> 不能用索引？**

```sql
WHERE col <> 100
```

**执行过程**：

```
1. 需要返回所有 col != 100 的行
2. 假设表有 1000 万行，其中 col=100 的有 100 行
3. 这意味着需要返回 9999900 行（几乎全部）
4. 使用索引的成本（查找 col!=100 的所有位置）比全表扫描还高
5. MySQL 优化器选择全表扫描
```

---

# 时间条件查询

## 一、模板（Template）

```sql
-- 方式 1：结果正确，但可能不能使用索引
WHERE YEAR(time_col) = 2024

-- 方式 2：结果正确，且可以使用索引（推荐）
WHERE time_col >= '2024-01-01'
AND time_col < '2025-01-01'
```

**选择原则**：

- **结果题**（只要求结果正确）→ 可以用 YEAR()
- **性能题**（要求优化性能）→ 必须用范围查询
- **生产环境** → 优先使用范围查询

## 二、例子（Example）

```sql
-- 方式 1：使用 YEAR() 函数
SELECT COUNT(*) FROM orders
WHERE YEAR(order_time) = 2024;
-- 结果正确：统计 2024 年的订单数
-- 性能：可能全表扫描（如果 order_time 有索引但被函数包裹，索引失效）

-- 方式 2：使用范围查询（推荐）
SELECT COUNT(*) FROM orders
WHERE order_time >= '2024-01-01'
AND order_time < '2025-01-01';
-- 结果正确：统计 2024 年的订单数
-- 性能：可以使用索引，查询速度快
```

**性能对比**（假设 orders 表有 1000 万条数据，order_time 有索引）：

```
方式 1（YEAR()）：~3 秒（全表扫描，对每行执行 YEAR() 函数）
方式 2（范围查询）：~50 毫秒（索引范围扫描）
```

## 三、例题（Question）

**选择题**：以下哪个 SQL 语句可以优化性能（假设 order_time 字段有索引）？

A.

```sql
SELECT * FROM orders WHERE YEAR(order_time) = 2024;
```

B.

```sql
SELECT * FROM orders
WHERE order_time >= '2024-01-01' AND order_time < '2025-01-01';
```

C. 两个性能相同

## 四、答案（Answer）

**B**

## 五、解释（Explanation）

**执行过程对比**：

**方式 1：YEAR(order_time) = 2024**

```
步骤 1：读取 orders 表的每一行（共 1000 万行）
步骤 2：对每一行的 order_time 字段执行 YEAR() 函数
  - 行 1：YEAR('2024-03-15') = 2024 → 匹配 ✅
  - 行 2：YEAR('2023-12-01') = 2023 → 不匹配 ❌
  - 行 3：YEAR('2024-06-20') = 2024 → 匹配 ✅
  - ...
  - 行 10000000：YEAR('2024-11-30') = 2024 → 匹配 ✅

问题：
- 对 1000 万行都执行了 YEAR() 函数（全表扫描）
- 即使 order_time 有索引，但因为使用了函数，索引失效
- 执行时间：~3 秒
```

**方式 2：范围查询**

```
步骤 1：在 order_time 的索引中查找范围
步骤 2：找到 >= '2024-01-01' 的第一个位置
  - 索引是有序的，可以快速定位
步骤 3：从该位置开始向后扫描
  - 返回所有 order_time >= '2024-01-01' 且 < '2025-01-01' 的行
步骤 4：当遇到 order_time >= '2025-01-01' 时停止扫描

优势：
- 利用索引的有序性，只扫描 2024 年的数据（假设 100 万行）
- 不需要对每行执行函数
- 执行时间：~50 毫秒（比方式 1 快 60 倍）
```

**底层模型**：

**索引结构（B+树）**：

```
索引节点存储的是 order_time 的原始值：
        2024-06-15
       /            \
  2023-12-01    2024-12-20
  /     \        /        \
...     ...    ...        ...

方式 1（YEAR()）：
- 索引存储：'2024-06-15'
- 查询需要：YEAR('2024-06-15') = 2024
- 需要对索引中的每个值计算函数 → 无法利用索引

方式 2（范围查询）：
- 索引存储：'2024-06-15'
- 查询需要：'2024-06-15' >= '2024-01-01' 且 < '2025-01-01'
- 可以直接在索引中比较值 → 可以利用索引
```

**其他时间函数的优化**：

```sql
-- ❌ 不能使用索引
WHERE MONTH(created_at) = 1        -- 查询 1 月的数据
WHERE DAY(created_at) = 15         -- 查询 15 日的数据
WHERE DATE(created_at) = '2024-01-15'  -- 查询某一天的数据

-- ✅ 可以使用索引的等价写法
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'  -- 1 月
WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16'  -- 1 月 15 日
WHERE created_at >= '2024-01-15 00:00:00'
AND created_at < '2024-01-16 00:00:00'  -- 某一天
```

**记忆要点**：

- **结果题**：可以用 `YEAR()` 函数，代码简单
- **性能题**：必须用范围查询，才能使用索引
- **生产环境**：优先使用范围查询，保证性能

---

# 聚合函数：SUM、AVG、MAX、MIN

## 一、模板（Template）

```sql
-- SUM：求和
SELECT SUM(col) FROM 表 WHERE 条件;

-- AVG：平均值
SELECT AVG(col) FROM 表 WHERE 条件;

-- MAX：最大值
SELECT MAX(col) FROM 表 WHERE 条件;

-- MIN：最小值
SELECT MIN(col) FROM 表 WHERE 条件;

-- 配合 GROUP BY 使用
SELECT X, SUM(Y) FROM 表 GROUP BY X;
```

**特点**：对**组**进行计算，必须配合 GROUP BY 使用

## 二、例子（Example）

```sql
-- 查询每个部门的总工资和平均工资
SELECT
    department,
    SUM(salary) AS total_salary,
    AVG(salary) AS avg_salary,
    MAX(salary) AS max_salary,
    MIN(salary) AS min_salary
FROM employees
GROUP BY department;
```

**数据示例**：

```
employees 表：
id | name   | department | salary
1  | Alice  | 研发部     | 15000
2  | Bob    | 研发部     | 18000
3  | Charlie| 销售部     | 12000
4  | David  | 销售部     | 10000
```

**查询结果**：

```
department | total_salary | avg_salary | max_salary | min_salary
-----------|--------------|------------|------------|-----------
研发部     | 33000        | 16500      | 18000      | 15000
销售部     | 22000        | 11000      | 12000      | 10000
```

## 三、例题（Question）

**SQL 填空**：查询每个类别的商品总销售额

```sql
SELECT category, ______(price * quantity) AS total_sales
FROM products
______ BY category;
```

A. SUM, GROUP  
B. AVG, GROUP  
C. SUM, ORDER  
D. COUNT, GROUP

## 四、答案（Answer）

**A. SUM, GROUP**

完整 SQL：

```sql
SELECT category, SUM(price * quantity) AS total_sales
FROM products
GROUP BY category;
```

## 五、解释（Explanation）

**执行步骤拆解**：

假设 products 表数据：

```
id | category | price | quantity
1  | 电子产品 | 1000  | 5
2  | 电子产品 | 2000  | 3
3  | 食品     | 50    | 10
4  | 食品     | 30    | 20
```

**执行过程**：

```
步骤 1：FROM products → 读取所有商品行
步骤 2：计算 price * quantity（对每行计算）
  行 1：1000 * 5 = 5000
  行 2：2000 * 3 = 6000
  行 3：50 * 10 = 500
  行 4：30 * 20 = 600

步骤 3：GROUP BY category → 按类别分组
  - 电子产品组：[行1(5000), 行2(6000)]
  - 食品组：[行3(500), 行4(600)]

步骤 4：SELECT category, SUM(price * quantity)
  - 电子产品组：SUM(5000, 6000) = 11000
  - 食品组：SUM(500, 600) = 1100

最终结果：
category | total_sales
---------|-------------
电子产品 | 11000
食品     | 1100
```

**聚合函数的计算对象**：

- **SUM / AVG / MAX / MIN** 对**一组数据**进行计算
- 必须先分组（GROUP BY），才能计算
- 如果没有 GROUP BY，会将整个表视为一组

**没有 GROUP BY 的情况**：

```sql
SELECT SUM(salary) FROM employees;
-- 将整个 employees 表视为一组，计算所有员工工资的总和
```

**聚合函数对 NULL 的处理**：

- **SUM / AVG**：忽略 NULL 值
- **MAX / MIN**：忽略 NULL 值
- **COUNT**：根据类型不同处理（COUNT(\*) 包括 NULL，COUNT(col) 忽略 NULL）

**示例**：

```sql
-- 假设 salary 列有 NULL 值
id | salary
1  | 10000
2  | NULL
3  | 15000

SELECT SUM(salary) FROM employees;  -- 25000（忽略 NULL）
SELECT AVG(salary) FROM employees;  -- 12500（25000 / 2，忽略 NULL）
SELECT MAX(salary) FROM employees;  -- 15000
SELECT MIN(salary) FROM employees;  -- 10000
```
