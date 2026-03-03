export type QuestionType = "sort" | "order" | "choice" | "true_false";

export interface SortQuestion {
  id: string;
  type: "sort";
  title: string;
  helperText?: string;
  codeTemplate: Array<
    | { type: "text"; value: string }
    | { type: "blank"; id: string }
  >;
  options: { id: string; label: string }[];
  correctByBlank: Record<string, string | string[]>;
}

export interface OrderQuestion {
  id: string;
  type: "order";
  title: string;
  helperText?: string;
  fragments: { id: string; label: string }[];
  correctOrder: string[];
}

/** 单选题：题干 + 多个选项，选一个正确答案（概念题） */
export interface ChoiceQuestion {
  id: string;
  type: "choice";
  title: string;
  helperText?: string;
  options: { id: string; label: string }[];
  correctId: string;
}

/** 判断题：题干 + 对/错 */
export interface TrueFalseQuestion {
  id: string;
  type: "true_false";
  title: string;
  helperText?: string;
  correct: boolean;
}

export type Question =
  | SortQuestion
  | OrderQuestion
  | ChoiceQuestion
  | TrueFalseQuestion;

export interface Lesson {
  id: string;
  title: string;
  questionIds: string[];
}

// ... Stage, Course, Part 定义保持不变 ...
export interface Stage { id: string; title: string; lessons: Lesson[]; }
export interface Course { id: string; name: string; stages: Stage[]; }
export interface Part { id: string; title: string; color: string; lessonIds: string[]; }

/** 每一小关默认需要多少次通关（在主页环形进度条和解锁逻辑里都会用到） */
export const DEFAULT_LESSON_PLAYS_TO_CLEAR = 5;

const lessonTitles = [
  // 1-12  输出相关（拆成两个部分，但主题一致，强调重复）
  "认识 C 语言",       // 1
  "第一个程序",       // 2
  "打印问候语",       // 3
  "输出数字",         // 4
  "练习：姓名",       // 5
  "输出多行文本",     // 6
  "打印简单菜单",     // 7
  "输出格式练习",     // 8
  "打印变量值",       // 9
  "调试用输出",       // 10
  "转义字符练习",     // 11
  "输出综合小测",     // 12

  // 13-24  变量与类型（两个部分，重复巩固）
  "变量入门",         // 13
  "整数类型",         // 14
  "浮点数",           // 15
  "字符与字符串",     // 16
  "声明练习",         // 17
  "多变量声明",       // 18
  "变量初始化练习",   // 19
  "变量综合小测",     // 20
  "常量与变量",       // 21
  "命名规范",         // 22
  "类型转换入门",     // 23
  "变量错误排查",     // 24

  // 25-30  表达式与算术运算
  "算术运算",         // 25
  "优先级",           // 26
  "计算总分",         // 27
  "表达式综合练习",   // 28
  "自增自减入门",     // 29
  "复合赋值练习",     // 30

  // 31-36  条件判断
  "if 入门",          // 31
  "if-else 结构",     // 32
  "多重 if",          // 33
  "条件判断综合",     // 34
  "嵌套条件练习",     // 35
  "分数等级判断",     // 36

  // 37-42  循环入门
  "while 入门",       // 37
  "求和练习",         // 38
  "for 入门",         // 39
  "循环综合",         // 40
  "嵌套循环入门",     // 41
  "循环打印图形",     // 42

  // 43-48  函数入门
  "函数入门",         // 43
  "带参函数",         // 44
  "返回值",           // 45
  "加法函数",         // 46
  "函数与变量作用域", // 47
  "函数综合练习",     // 48

  // 49-54  指针入门
  "指针初体验",       // 49
  "地址概念",         // 50
  "指针与变量",       // 51
  "指针与数组入门",   // 52
  "指针改写函数参数", // 53
  "指针综合小测",     // 54

  // 55-60  综合与挑战（逐步加大难度）
  "小项目",           // 55
  "综合复习 1",       // 56
  "综合复习 2",       // 57
  "进阶练习",         // 58
  "进阶挑战",         // 59
  "终极挑战",         // 60
];

// 题库定义
// 完整修复类型报错后的题库
export const questions: Record<string, Question> = {
  // --- Part 1: 输出入门 (1-5关) ---
  "q_syntax_semicolon": {
    id: "q_syntax_semicolon", type: "sort", title: "C 语言的语句必须以什么结尾？",
    codeTemplate: [{ type: "text", value: 'printf("Hello")' }, { type: "blank", id: "s1" }],
    options: [{ id: "o1", label: ";" }, { id: "o2", label: ":" }, { id: "o3", label: "." }],
    correctByBlank: { "s1": "o1" }
  },
  "q_print_basic": {
    id: "q_print_basic", type: "sort", title: "使用哪个函数进行屏幕输出？",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: '("C 语言");' }],
    options: [{ id: "o1", label: "printf" }, { id: "o2", label: "print" }, { id: "o3", label: "output" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_order_hello": {
    id: "q_order_hello", type: "order", title: "排列代码以输出 Hello World",
    fragments: [{ id: "f1", label: "printf" }, { id: "f2", label: "(" }, { id: "f3", label: '"Hello World"' }, { id: "f4", label: ");" }],
    correctOrder: ["f1", "f2", "f3", "f4"]
  },
  // 第3关 打印问候语
  "q_print_hi": {
    id: "q_print_hi", type: "sort", title: "补全代码，打印出 Hi",
    codeTemplate: [{ type: "text", value: "printf(\"" }, { type: "blank", id: "s1" }, { type: "text", value: "\");" }],
    options: [{ id: "o1", label: '"Hi"' }, { id: "o2", label: "Hi" }, { id: "o3", label: "'Hi'" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_print_greeting": {
    id: "q_print_greeting", type: "sort", title: "用 printf 输出一句问候语",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: '("你好");' }],
    options: [{ id: "o1", label: "printf" }, { id: "o2", label: "print" }, { id: "o3", label: "echo" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_quote_string": {
    id: "q_quote_string", type: "sort", title: "字符串两边要加什么符号？",
    codeTemplate: [{ type: "text", value: "printf(" }, { type: "blank", id: "s1" }, { type: "text", value: "Hello" }, { type: "blank", id: "s2" }, { type: "text", value: ");" }],
    options: [{ id: "o1", label: '"' }, { id: "o2", label: "'" }, { id: "o3", label: "`" },{ id: "o4", label: '"' }, { id: "o5", label: "'" }, { id: "o6", label: "`" }],
    correctByBlank: { "s1": "o1", "s2": "o4" }
  },
  // 第4关 输出数字
  "q_print_number": {
    id: "q_print_number", type: "sort", title: "打印整数 42，格式串里填什么占位符？",
    codeTemplate: [{ type: "text", value: 'printf("' }, { type: "blank", id: "s1" }, { type: "text", value: '", 42);' }],
    options: [{ id: "o1", label: "%d" }, { id: "o2", label: "%s" }, { id: "o3", label: "%f" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_print_int_code": {
    id: "q_print_int_code", type: "sort", title: "补全：用 printf 输出变量 n 的值",
    codeTemplate: [{ type: "text", value: 'printf("%d", ' }, { type: "blank", id: "s1" }, { type: "text", value: ");" }],
    options: [{ id: "o1", label: "n" }, { id: "o2", label: '"n"' }, { id: "o3", label: "%n" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_semicolon_after_print": {
    id: "q_semicolon_after_print", type: "sort", title: "printf 语句末尾要加什么？",
    codeTemplate: [{ type: "text", value: 'printf("ok")' }, { type: "blank", id: "s1" }],
    options: [{ id: "o1", label: ";" }, { id: "o2", label: "." }, { id: "o3", label: "," }],
    correctByBlank: { "s1": "o1" }
  },
  // 第5关 练习：姓名
  "q_print_name": {
    id: "q_print_name", type: "sort", title: "补全代码，打印你的名字（字符串）",
    codeTemplate: [{ type: "text", value: "printf(" }, { type: "blank", id: "s1" }, { type: "text", value: ");" }],
    options: [{ id: "o1", label: '"小明"' }, { id: "o2", label: "小明" }, { id: "o3", label: "name" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_print_two": {
    id: "q_print_two", type: "sort", title: "先打印 Hello 再打印 World，中间缺什么？",
    codeTemplate: [{ type: "text", value: 'printf("Hello");' }, { type: "blank", id: "s1" }, { type: "text", value: 'printf("World");' }],
    options: [{ id: "o1", label: " " }, { id: "o2", label: ";" }, { id: "o3", label: "\\n" }],
    correctByBlank: { "s1": "o2" }
  },

  // --- Part 2: 变量与类型 (6-11关) ---
  "q_var_int": {
    id: "q_var_int", type: "sort", title: "声明一个名为 age 的整数变量",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " age;" }],
    options: [{ id: "o1", label: "int" }, { id: "o2", label: "float" }, { id: "o3", label: "char" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_var_assign": {
    id: "q_var_assign", type: "sort", title: "给变量 x 赋值为 10",
    codeTemplate: [{ type: "text", value: "int x " }, { type: "blank", id: "s1" }, { type: "text", value: " 10;" }],
    options: [{ id: "o1", label: "=" }, { id: "o2", label: "==" }, { id: "o3", label: "is" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_print_format_d": {
    id: "q_print_format_d", type: "sort", title: "打印整数时，引号内应填什么占位符？",
    codeTemplate: [{ type: "text", value: 'printf("' }, { type: "blank", id: "s1" }, { type: "text", value: '", age);' }],
    options: [{ id: "o1", label: "%d" }, { id: "o2", label: "%f" }, { id: "o3", label: "%s" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_type_float": {
    id: "q_type_float", type: "sort", title: "声明一个存小数（如 3.14）的变量类型",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " pi = 3.14;" }],
    options: [{ id: "o1", label: "float" }, { id: "o2", label: "int" }, { id: "o3", label: "char" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第8关 浮点数
  "q_float_format": {
    id: "q_float_format", type: "sort", title: "用 printf 打印小数，格式串里用哪个占位符？",
    codeTemplate: [{ type: "text", value: 'printf("' }, { type: "blank", id: "s1" }, { type: "text", value: '", 3.14);' }],
    options: [{ id: "o1", label: "%f" }, { id: "o2", label: "%d" }, { id: "o3", label: "%s" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_float_declare": {
    id: "q_float_declare", type: "sort", title: "声明一个名为 score 的小数变量",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " score;" }],
    options: [{ id: "o1", label: "float" }, { id: "o2", label: "int" }, { id: "o3", label: "double" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第9关 字符与字符串
  "q_char_type": {
    id: "q_char_type", type: "sort", title: "存一个字符（如 'A'）用什么类型？",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " c = 'A';" }],
    options: [{ id: "o1", label: "char" }, { id: "o2", label: "int" }, { id: "o3", label: "string" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_string_quote": {
    id: "q_string_quote", type: "sort", title: "C 里字符串用双引号，字符用单引号。补全：",
    codeTemplate: [
      { type: "text", value: "char a = " },
      { type: "blank", id: "s1" },
      { type: "text", value: "x" },
      { type: "blank", id: "s2" },
      { type: "text", value: ";" }
    ],
    options: [
      { id: "o1", label: "'" },
      { id: "o2", label: '"' },
      { id: "o3", label: "`" },
      { id: "o4", label: "'" },
      { id: "o5", label: '"' },
      { id: "o6", label: "`" }
    ],
    correctByBlank: { "s1": "o1", "s2": "o4" }
  },
  // 第10关 声明练习
  "q_multi_declare": {
    id: "q_multi_declare", type: "sort", title: "同时声明两个整数 a 和 b",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " a, b;" }],
    options: [{ id: "o1", label: "int" }, { id: "o2", label: "integer" }, { id: "o3", label: "num" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_init_var": {
    id: "q_init_var", type: "sort", title: "声明整数 n 并赋初值为 0",
    codeTemplate: [{ type: "text", value: "int n " }, { type: "blank", id: "s1" }, { type: "text", value: " 0;" }],
    options: [{ id: "o1", label: "=" }, { id: "o2", label: "==" }, { id: "o3", label: ":" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第11关 输入输出综合
  "q_scanf_basic": {
    id: "q_scanf_basic", type: "sort", title: "从键盘读入一个整数到变量 x",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: '("%d", &x);' }],
    options: [{ id: "o1", label: "scanf" }, { id: "o2", label: "read" }, { id: "o3", label: "input" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_printf_scanf_order": {
    id: "q_printf_scanf_order", type: "sort", title: "先提示再读入：printf 后面通常跟什么？",
    codeTemplate: [{ type: "text", value: 'printf("输入 n: "); ' }, { type: "blank", id: "s1" }, { type: "text", value: '("%d", &n);' }],
    options: [{ id: "o1", label: "scanf" }, { id: "o2", label: "read" }, { id: "o3", label: "get" }],
    correctByBlank: { "s1": "o1" }
  },

  // --- Part 3: 表达式与条件 (12-17关) ---
  "q_math_add": {
    id: "q_math_add", type: "sort", title: "完成加法运算",
    codeTemplate: [{ type: "text", value: "sum = 5 " }, { type: "blank", id: "s1" }, { type: "text", value: " 3;" }],
    options: [{ id: "o1", label: "+" }, { id: "o2", label: "add" }, { id: "o3", label: "plus" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_if_basic": {
    id: "q_if_basic", type: "sort", title: "完成 if 语句判断 a 是否大于 0",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " (a > 0) { ... }" }],
    options: [{ id: "o1", label: "if" }, { id: "o2", label: "when" }, { id: "o3", label: "check" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_ifelse_order": {
    id: "q_ifelse_order", type: "order", title: "排列 if-else 完整结构",
    fragments: [{ id: "f1", label: "if(x > 0)" }, { id: "f2", label: "{ printf(\"A\"); }" }, { id: "f3", label: "else" }, { id: "f4", label: "{ printf(\"B\"); }" }],
    correctOrder: ["f1", "f2", "f3", "f4"]
  },
  // 第13关 优先级
  "q_mul_before_add": {
    id: "q_mul_before_add", type: "sort", title: "2 + 3 * 4 先算乘法。补全：先算 a * b",
    codeTemplate: [{ type: "text", value: "result = 5 + " }, { type: "blank", id: "s1" }, { type: "text", value: " * 2;" }],
    options: [{ id: "o1", label: "3" }, { id: "o2", label: "5+3" }, { id: "o3", label: "a" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_paren_first": {
    id: "q_paren_first", type: "sort", title: "用括号让 (2+3)*4 先算加法，补全",
    codeTemplate: [{ type: "text", value: "x = (" }, { type: "blank", id: "s1" }, { type: "text", value: ") * 4;" }],
    options: [{ id: "o1", label: "2+3" }, { id: "o2", label: "2 + 3" }, { id: "o3", label: "2 +3" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第14关 计算总分
  "q_sum_three": {
    id: "q_sum_three", type: "sort", title: "计算三科成绩之和 total = a + b + ?",
    codeTemplate: [{ type: "text", value: "total = a + b + " }, { type: "blank", id: "s1" }, { type: "text", value: ";" }],
    options: [{ id: "o1", label: "c" }, { id: "o2", label: "3" }, { id: "o3", label: "sum" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_avg_calc": {
    id: "q_avg_calc", type: "sort", title: "平均分 = 总分除以科目数，补全",
    codeTemplate: [{ type: "text", value: "avg = total " }, { type: "blank", id: "s1" }, { type: "text", value: " 3;" }],
    options: [{ id: "o1", label: "/" }, { id: "o2", label: "÷" }, { id: "o3", label: "div" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第16关 if-else 结构
  "q_else_keyword": {
    id: "q_else_keyword", type: "sort", title: "if 条件不成立时，用哪个关键字？",
    codeTemplate: [{ type: "text", value: "if (x > 0) { ... } " }, { type: "blank", id: "s1" }, { type: "text", value: " { ... }" }],
    options: [{ id: "o1", label: "else" }, { id: "o2", label: "otherwise" }, { id: "o3", label: "elif" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第17关 多重 if
  "q_elseif_chain": {
    id: "q_elseif_chain", type: "sort", title: "多个条件依次判断：if...else if...最后 else，补全",
    codeTemplate: [{ type: "text", value: "if (a > 0) { } else " }, { type: "blank", id: "s1" }, { type: "text", value: " (a < 0) { } else { }" }],
    options: [{ id: "o1", label: "if" }, { id: "o2", label: "else if" }, { id: "o3", label: "when" }],
    correctByBlank: { "s1": "o2" }
  },

  // --- Part 4: 循环与数组 (18-24关) ---
  "q_while_loop": {
    id: "q_while_loop", type: "sort", title: "当条件满足时持续运行，使用哪个关键字？",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " (i < 10) { i++; }" }],
    options: [{ id: "o1", label: "while" }, { id: "o2", label: "repeat" }, { id: "o3", label: "loop" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_arr_declare": {
    id: "q_arr_declare", type: "sort", title: "声明一个能放 3 个数的数组",
    codeTemplate: [{ type: "text", value: "int arr" }, { type: "blank", id: "s1" }, { type: "text", value: ";" }],
    options: [{ id: "o1", label: "[3]" }, { id: "o2", label: "(3)" }, { id: "o3", label: "{3}" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第19关 求和练习
  "q_loop_sum": {
    id: "q_loop_sum", type: "sort", title: "循环里累加：sum = sum + i; 等价于？",
    codeTemplate: [{ type: "text", value: "sum " }, { type: "blank", id: "s1" }, { type: "text", value: "= sum + i;" }],
    options: [{ id: "o1", label: "+=" }, { id: "o2", label: "=+" }, { id: "o3", label: "plus" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_while_condition": {
    id: "q_while_condition", type: "sort", title: "while 和条件之间可以没有字符或有一个空格，补全",
    codeTemplate: [{ type: "text", value: "while" }, { type: "blank", id: "s1" }, { type: "text", value: "(i < 10)" }],
    options: [{ id: "o1", label: " " }, { id: "o2", label: "" }, { id: "o3", label: "  " }],
    // 允许有一个空格或没有空格，两种写法都算对
    correctByBlank: { "s1": ["o1", "o2"] }
  },
  // 第20关 for 入门
  "q_for_syntax": {
    id: "q_for_syntax", type: "sort", title: "for 循环三部分：初值；条件；步进。补全",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " (i = 0; i < 10; i++)" }],
    options: [{ id: "o1", label: "for" }, { id: "o2", label: "loop" }, { id: "o3", label: "repeat" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_for_increment": {
    id: "q_for_increment", type: "sort", title: "for 里每轮结束后执行 i 加 1",
    codeTemplate: [{ type: "text", value: "for (i = 0; i < n; " }, { type: "blank", id: "s1" }, { type: "text", value: ")" }],
    options: [{ id: "o1", label: "i++" }, { id: "o2", label: "i+1" }, { id: "o3", label: "++i" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第21关 break/continue
  "q_break_loop": {
    id: "q_break_loop", type: "sort", title: "立刻跳出循环用哪个关键字？",
    codeTemplate: [{ type: "text", value: "if (x < 0) " }, { type: "blank", id: "s1" }, { type: "text", value: ";" }],
    options: [{ id: "o1", label: "break" }, { id: "o2", label: "exit" }, { id: "o3", label: "stop" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_continue_next": {
    id: "q_continue_next", type: "sort", title: "跳过本轮，进入下一轮循环",
    codeTemplate: [{ type: "text", value: "if (i % 2 == 0) " }, { type: "blank", id: "s1" }, { type: "text", value: ";" }],
    options: [{ id: "o1", label: "continue" }, { id: "o2", label: "skip" }, { id: "o3", label: "next" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第22关 循环综合
  "q_loop_array": {
    id: "q_loop_array", type: "sort", title: "遍历数组：访问下标为 i 的元素",
    codeTemplate: [{ type: "text", value: "arr[" }, { type: "blank", id: "s1" }, { type: "text", value: "]" }],
    options: [{ id: "o1", label: "i" }, { id: "o2", label: "0" }, { id: "o3", label: "n" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第23关 数组基础
  "q_arr_index": {
    id: "q_arr_index", type: "sort", title: "数组下标从几开始？",
    codeTemplate: [{ type: "text", value: "int a[5]; a[" }, { type: "blank", id: "s1" }, { type: "text", value: "] = 1;" }],
    options: [{ id: "o1", label: "0" }, { id: "o2", label: "1" }, { id: "o3", label: "2" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第24关 数组遍历
  "q_for_arr": {
    id: "q_for_arr", type: "sort", title: "遍历长度为 n 的数组，条件写 i < ?",
    codeTemplate: [{ type: "text", value: "for (i = 0; i < " }, { type: "blank", id: "s1" }, { type: "text", value: "; i++)" }],
    options: [{ id: "o1", label: "n" }, { id: "o2", label: "n-1" }, { id: "o3", label: "length" }],
    correctByBlank: { "s1": "o1" }
  },

  // --- Part 5: 函数与进阶 (25-32关) ---
  "q_func_return": {
    id: "q_func_return", type: "sort", title: "在函数结束时向调用者传回值",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " result;" }],
    options: [{ id: "o1", label: "return" }, { id: "o2", label: "exit" }, { id: "o3", label: "give" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_ptr_init": {
    id: "q_ptr_init", type: "sort", title: "声明一个指向整数的指针 p",
    codeTemplate: [{ type: "text", value: "int " }, { type: "blank", id: "s1" }, { type: "text", value: "p;" }],
    options: [{ id: "o1", label: "*" }, { id: "o2", label: "&" }, { id: "o3", label: "#" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第26关 带参函数
  "q_func_param": {
    id: "q_func_param", type: "sort", title: "函数定义时，参数要写类型和名字。补全",
    codeTemplate: [{ type: "text", value: "void f(" }, { type: "blank", id: "s1" }, { type: "text", value: " x) { }" }],
    options: [{ id: "o1", label: "int" }, { id: "o2", label: "integer" }, { id: "o3", label: "num" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_two_params": {
    id: "q_two_params", type: "sort", title: "函数接受两个整数参数 a 和 b",
    codeTemplate: [{ type: "text", value: "int add(" }, { type: "blank", id: "s1" }, { type: "text", value: " a, int b)" }],
    options: [{ id: "o1", label: "int" }, { id: "o2", label: "int " }, { id: "o3", label: "integer" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第27关 返回值
  "q_return_value": {
    id: "q_return_value", type: "sort", title: "函数返回一个整数，用哪个关键字？",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " 0;" }],
    options: [{ id: "o1", label: "return" }, { id: "o2", label: "exit" }, { id: "o3", label: "result" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_return_type": {
    id: "q_return_type", type: "sort", title: "函数返回整数，定义时函数名前面写什么？",
    codeTemplate: [{ type: "blank", id: "s1" }, { type: "text", value: " getValue() { return 1; }" }],
    options: [{ id: "o1", label: "int" }, { id: "o2", label: "void" }, { id: "o3", label: "return" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第28关 加法函数
  "q_add_func_body": {
    id: "q_add_func_body", type: "sort", title: "补全加法函数体：return a ? b;",
    codeTemplate: [{ type: "text", value: "return a " }, { type: "blank", id: "s1" }, { type: "text", value: " b;" }],
    options: [{ id: "o1", label: "+" }, { id: "o2", label: "plus" }, { id: "o3", label: "add" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第30关 地址概念
  "q_address_operator": {
    id: "q_address_operator", type: "sort", title: "取变量 x 的地址，用哪个符号？",
    codeTemplate: [{ type: "text", value: "scanf(\"%d\", " }, { type: "blank", id: "s1" }, { type: "text", value: "x);" }],
    options: [{ id: "o1", label: "&" }, { id: "o2", label: "*" }, { id: "o3", label: "#" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_pointer_deref": {
    id: "q_pointer_deref", type: "sort", title: "通过指针 p 取它指向的值",
    codeTemplate: [{ type: "text", value: "int x = " }, { type: "blank", id: "s1" }, { type: "text", value: "p;" }],
    options: [{ id: "o1", label: "*" }, { id: "o2", label: "&" }, { id: "o3", label: "->" }],
    correctByBlank: { "s1": "o1" }
  },
  // 第31关 小项目 / 第32关 终极挑战（复用综合题）
  "q_printf_format": {
    id: "q_printf_format", type: "sort", title: "同时输出字符串和整数，格式串里要有占位符",
    codeTemplate: [{ type: "text", value: 'printf("n = ' }, { type: "blank", id: "s1" }, { type: "text", value: '", n);' }],
    options: [{ id: "o1", label: "%d" }, { id: "o2", label: "%s" }, { id: "o3", label: "%f" }],
    correctByBlank: { "s1": "o1" }
  },
  "q_loop_print": {
    id: "q_loop_print", type: "sort", title: "用 for 循环依次打印 0 到 n-1",
    codeTemplate: [{ type: "text", value: "for (i = 0; i < n; i++) printf(\"%d \", " }, { type: "blank", id: "s1" }, { type: "text", value: ");" }],
    options: [{ id: "o1", label: "i" }, { id: "o2", label: "n" }, { id: "o3", label: "i+1" }],
    correctByBlank: { "s1": "o1" }
  },

  // --- 单选题（概念题）---
  "q_choice_main": {
    id: "q_choice_main", type: "choice", title: "C 语言程序从哪个函数开始执行？",
    helperText: "选出一个正确答案。",
    options: [
      { id: "o1", label: "main" },
      { id: "o2", label: "start" },
      { id: "o3", label: "begin" },
      { id: "o4", label: "run" },
    ],
    correctId: "o1",
  },
  "q_choice_semicolon": {
    id: "q_choice_semicolon", type: "choice", title: "C 语言中，每条语句通常以什么符号结束？",
    options: [
      { id: "o1", label: "分号 ;" },
      { id: "o2", label: "句号 。" },
      { id: "o3", label: "逗号 ，" },
      { id: "o4", label: "冒号 :" },
    ],
    correctId: "o1",
  },
  "q_choice_int_type": {
    id: "q_choice_int_type", type: "choice", title: "要存储整数，应使用哪种数据类型？",
    options: [
      { id: "o1", label: "int" },
      { id: "o2", label: "float" },
      { id: "o3", label: "char" },
      { id: "o4", label: "string" },
    ],
    correctId: "o1",
  },
  "q_choice_loop": {
    id: "q_choice_loop", type: "choice", title: "for 循环的三个表达式分别控制什么？",
    helperText: "for (A; B; C) 中 A、B、C 的常见含义。",
    options: [
      { id: "o1", label: "初始化；条件；更新" },
      { id: "o2", label: "条件；初始化；更新" },
      { id: "o3", label: "更新；条件；初始化" },
      { id: "o4", label: "条件；更新；初始化" },
    ],
    correctId: "o1",
  },

  // --- 判断题 ---
  "q_tf_printf": {
    id: "q_tf_printf", type: "true_false", title: "printf 是 C 语言里用来在屏幕上输出的函数。",
    correct: true,
  },
  "q_tf_float": {
    id: "q_tf_float", type: "true_false", title: "float 类型只能存储整数。",
    correct: false,
  },
  "q_tf_array_zero": {
    id: "q_tf_array_zero", type: "true_false", title: "C 语言中数组的下标从 0 开始。",
    correct: true,
  },
};

// --- Java 原子题库：结构与 C 语言类似，但代码与关键字改为 Java 写法 ---
export const javaQuestions: Record<string, Question> = {
  // 输出入门
  "java_q_print_basic": {
    id: "java_q_print_basic",
    type: "sort",
    title: "用 System.out.println 输出一行文字",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: '("Hello, Java");' },
    ],
    options: [
      { id: "o1", label: "System.out.println" },
      { id: "o2", label: "printf" },
      { id: "o3", label: "console.log" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_print_number": {
    id: "java_q_print_number",
    type: "sort",
    title: "用 System.out.println 打印整数 42",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: "(42);" },
    ],
    options: [
      { id: "o1", label: "System.out.println" },
      { id: "o2", label: "System.out.print" },
      { id: "o3", label: "print" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_string_quotes": {
    id: "java_q_string_quotes",
    type: "sort",
    title: "Java 中字符串要写在双引号里，补全：",
    codeTemplate: [
      { type: "text", value: "System.out.println(" },
      { type: "blank", id: "s1" },
      { type: "text", value: "Hello" },
      { type: "blank", id: "s2" },
      { type: "text", value: ");" },
    ],
    options: [
      { id: "o1", label: '"' },
      { id: "o2", label: "'" },
      { id: "o3", label: "`" },
      { id: "o4", label: '"' },
      { id: "o5", label: "'" },
      { id: "o6", label: "`" },
    ],
    correctByBlank: { s1: "o1", s2: "o4" },
  },
  "java_q_order_main": {
    id: "java_q_order_main",
    type: "order",
    title: "排列语句，写出最小的 Java 主方法",
    fragments: [
      { id: "f1", label: "public class Main {" },
      { id: "f2", label: "public static void main(String[] args) {" },
      { id: "f3", label: 'System.out.println("Hi");' },
      { id: "f4", label: "}" },
      { id: "f5", label: "}" },
    ],
    correctOrder: ["f1", "f2", "f3", "f4", "f5"],
  },

  // 变量与类型
  "java_q_var_int": {
    id: "java_q_var_int",
    type: "sort",
    title: "在 Java 中声明一个整数变量 age",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: " age;" },
    ],
    options: [
      { id: "o1", label: "int" },
      { id: "o2", label: "float" },
      { id: "o3", label: "String" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_var_assign": {
    id: "java_q_var_assign",
    type: "sort",
    title: "给变量 x 赋值为 10",
    codeTemplate: [
      { type: "text", value: "int x " },
      { type: "blank", id: "s1" },
      { type: "text", value: " 10;" },
    ],
    options: [
      { id: "o1", label: "=" },
      { id: "o2", label: "==" },
      { id: "o3", label: ":=" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_choice_type": {
    id: "java_q_choice_type",
    type: "choice",
    title: "在 Java 中存储小数，应该使用哪种类型？",
    options: [
      { id: "o1", label: "double" },
      { id: "o2", label: "int" },
      { id: "o3", label: "char" },
      { id: "o4", label: "boolean" },
    ],
    correctId: "o1",
  },

  // 表达式与条件
  "java_q_add_expr": {
    id: "java_q_add_expr",
    type: "sort",
    title: "完成加法表达式 total = a + b;",
    codeTemplate: [
      { type: "text", value: "int total = a " },
      { type: "blank", id: "s1" },
      { type: "text", value: " b;" },
    ],
    options: [
      { id: "o1", label: "+" },
      { id: "o2", label: "plus" },
      { id: "o3", label: "add" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_if_basic": {
    id: "java_q_if_basic",
    type: "sort",
    title: "使用 if 判断 score 是否大于等于 60",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: " (score >= 60) {" },
    ],
    options: [
      { id: "o1", label: "if" },
      { id: "o2", label: "when" },
      { id: "o3", label: "check" },
    ],
    correctByBlank: { s1: "o1" },
  },

  // 循环与数组
  "java_q_for_basic": {
    id: "java_q_for_basic",
    type: "sort",
    title: "补全 for 循环：从 0 打印到 9",
    codeTemplate: [
      { type: "text", value: "for (int i = 0; i < 10; " },
      { type: "blank", id: "s1" },
      { type: "text", value: ") {" },
    ],
    options: [
      { id: "o1", label: "i++" },
      { id: "o2", label: "i+1" },
      { id: "o3", label: "++" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_arr_declare": {
    id: "java_q_arr_declare",
    type: "sort",
    title: "声明一个长度为 3 的 int 数组",
    codeTemplate: [
      { type: "text", value: "int[] nums = new int" },
      { type: "blank", id: "s1" },
      { type: "text", value: ";" },
    ],
    options: [
      { id: "o1", label: "[3]" },
      { id: "o2", label: "(3)" },
      { id: "o3", label: "{3}" },
    ],
    correctByBlank: { s1: "o1" },
  },

  // 函数 / 方法
  "java_q_method_decl": {
    id: "java_q_method_decl",
    type: "sort",
    title: "补全一个返回 int 的方法 add",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: " int add(int a, int b) { return a + b; }" },
    ],
    options: [
      { id: "o1", label: "public" },
      { id: "o2", label: "void" },
      { id: "o3", label: "static" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "java_q_tf_main": {
    id: "java_q_tf_main",
    type: "true_false",
    title: "Java 程序总是从 main 方法开始执行。",
    correct: true,
  },
};

// --- Python 原子题库 ---
export const pythonQuestions: Record<string, Question> = {
  // 输出入门
  "py_q_print_basic": {
    id: "py_q_print_basic",
    type: "sort",
    title: "在 Python 中，使用哪个函数打印一行文字？",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: '("Hello, Python")' },
    ],
    options: [
      { id: "o1", label: "print" },
      { id: "o2", label: "printf" },
      { id: "o3", label: "console.log" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_print_number": {
    id: "py_q_print_number",
    type: "sort",
    title: "补全代码：打印数字 42",
    codeTemplate: [
      { type: "text", value: "print(" },
      { type: "blank", id: "s1" },
      { type: "text", value: ")" },
    ],
    options: [
      { id: "o1", label: "42" },
      { id: "o2", label: '"42"' },
      { id: "o3", label: "'42'" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_string_quotes": {
    id: "py_q_string_quotes",
    type: "sort",
    title: "Python 中字符串可以用双引号，补全：",
    codeTemplate: [
      { type: "text", value: "print(" },
      { type: "blank", id: "s1" },
      { type: "text", value: "Hello" },
      { type: "blank", id: "s2" },
      { type: "text", value: ")" },
    ],
    options: [
      { id: "o1", label: '"' },
      { id: "o2", label: "'" },
      { id: "o3", label: "`" },
      { id: "o4", label: '"' },
      { id: "o5", label: "'" },
      { id: "o6", label: "`" },
    ],
    correctByBlank: { s1: "o1", s2: "o4" },
  },

  // 变量与类型
  "py_q_var_assign": {
    id: "py_q_var_assign",
    type: "sort",
    title: "在 Python 中给变量 x 赋值为 10",
    codeTemplate: [
      { type: "text", value: "x " },
      { type: "blank", id: "s1" },
      { type: "text", value: " 10" },
    ],
    options: [
      { id: "o1", label: "=" },
      { id: "o2", label: "==" },
      { id: "o3", label: ":=" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_choice_type": {
    id: "py_q_choice_type",
    type: "choice",
    title: "在 Python 中，以下哪种写法可以存储小数？",
    options: [
      { id: "o1", label: "pi = 3.14" },
      { id: "o2", label: "float pi = 3.14" },
      { id: "o3", label: "double pi = 3.14" },
      { id: "o4", label: "pi := 3.14" },
    ],
    correctId: "o1",
  },

  // 表达式与条件
  "py_q_add_expr": {
    id: "py_q_add_expr",
    type: "sort",
    title: "补全加法：total = a ? b",
    codeTemplate: [
      { type: "text", value: "total = a " },
      { type: "blank", id: "s1" },
      { type: "text", value: " b" },
    ],
    options: [
      { id: "o1", label: "+" },
      { id: "o2", label: "plus" },
      { id: "o3", label: "add" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_if_basic": {
    id: "py_q_if_basic",
    type: "sort",
    title: "使用 if 判断 score 是否大于等于 60，补全：",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: " score >= 60:" },
    ],
    options: [
      { id: "o1", label: "if" },
      { id: "o2", label: "when" },
      { id: "o3", label: "check" },
    ],
    correctByBlank: { s1: "o1" },
  },

  // 循环与序列
  "py_q_for_range": {
    id: "py_q_for_range",
    type: "sort",
    title: "用 for 循环打印 0 到 9，补全 range 参数",
    codeTemplate: [
      { type: "text", value: "for i in range(" },
      { type: "blank", id: "s1" },
      { type: "text", value: "):" },
    ],
    options: [
      { id: "o1", label: "10" },
      { id: "o2", label: "0, 9" },
      { id: "o3", label: "1, 10" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_list_index": {
    id: "py_q_list_index",
    type: "sort",
    title: "列表下标从几开始？补全：nums[?] = 1",
    codeTemplate: [
      { type: "text", value: "nums[" },
      { type: "blank", id: "s1" },
      { type: "text", value: "] = 1" },
    ],
    options: [
      { id: "o1", label: "0" },
      { id: "o2", label: "1" },
      { id: "o3", label: "len(nums)" },
    ],
    correctByBlank: { s1: "o1" },
  },

  // 函数
  "py_q_def_func": {
    id: "py_q_def_func",
    type: "sort",
    title: "定义一个函数 add，接受 a 和 b 两个参数",
    codeTemplate: [
      { type: "blank", id: "s1" },
      { type: "text", value: " add(a, b):" },
    ],
    options: [
      { id: "o1", label: "def" },
      { id: "o2", label: "function" },
      { id: "o3", label: "fn" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_return": {
    id: "py_q_return",
    type: "sort",
    title: "在函数里返回 a + b，补全：",
    codeTemplate: [
      { type: "text", value: "    " },
      { type: "blank", id: "s1" },
      { type: "text", value: " a + b" },
    ],
    options: [
      { id: "o1", label: "return" },
      { id: "o2", label: "result" },
      { id: "o3", label: "yield" },
    ],
    correctByBlank: { s1: "o1" },
  },
  "py_q_tf_indent": {
    id: "py_q_tf_indent",
    type: "true_false",
    title: "在 Python 中，缩进是语法的一部分，写错缩进会报错。",
    correct: true,
  },
};

// --- 2. 知识点标签映射（原子题库分组） ---
const TAGS: Record<string, string[]> = {
  // 输出相关
  output: [
    "q_syntax_semicolon",
    "q_print_basic",
    "q_order_hello",
    "q_print_hi",
    "q_print_greeting",
    "q_quote_string",
    "q_print_number",
    "q_print_int_code",
    "q_semicolon_after_print",
    "q_print_name",
    "q_print_two",
    "q_printf_format",
    "q_loop_print",
    "q_choice_main",
    "q_choice_semicolon",
    "q_tf_printf",
  ],
  // 变量与类型
  vars: [
    "q_var_int",
    "q_var_assign",
    "q_print_format_d",
    "q_type_float",
    "q_float_format",
    "q_float_declare",
    "q_char_type",
    "q_string_quote",
    "q_multi_declare",
    "q_init_var",
    "q_scanf_basic",
    "q_printf_scanf_order",
    "q_choice_int_type",
    "q_tf_float",
  ],
  // 表达式与数学
  math: ["q_math_add", "q_mul_before_add", "q_paren_first", "q_sum_three", "q_avg_calc"],
  // 条件与逻辑
  logic: ["q_if_basic", "q_ifelse_order", "q_else_keyword", "q_elseif_chain"],
  // 循环
  loop: [
    "q_while_loop",
    "q_loop_sum",
    "q_while_condition",
    "q_for_syntax",
    "q_for_increment",
    "q_break_loop",
    "q_continue_next",
    "q_loop_array",
    "q_for_arr",
    "q_loop_print",
    "q_choice_loop",
  ],
  // 数组
  array: ["q_arr_declare", "q_arr_index", "q_loop_array", "q_for_arr", "q_tf_array_zero"],
  // 函数
  func: [
    "q_func_return",
    "q_func_param",
    "q_two_params",
    "q_return_value",
    "q_return_type",
    "q_add_func_body",
  ],
  // 指针
  ptr: ["q_ptr_init", "q_address_operator", "q_pointer_deref"],
};

// Java 题库标签映射（结构与 TAGS 一致）
const JAVA_TAGS: Record<string, string[]> = {
  output: ["java_q_print_basic", "java_q_print_number", "java_q_string_quotes", "java_q_order_main"],
  vars: ["java_q_var_int", "java_q_var_assign", "java_q_choice_type"],
  math: ["java_q_add_expr"],
  logic: ["java_q_if_basic"],
  loop: ["java_q_for_basic"],
  array: ["java_q_arr_declare"],
  func: ["java_q_method_decl", "java_q_tf_main"],
  ptr: [], // Java 入门不涉及裸指针，可留空
};

// Python 题库标签映射
const PY_TAGS: Record<string, string[]> = {
  output: ["py_q_print_basic", "py_q_print_number", "py_q_string_quotes"],
  vars: ["py_q_var_assign", "py_q_choice_type"],
  math: ["py_q_add_expr"],
  logic: ["py_q_if_basic"],
  loop: ["py_q_for_range"],
  array: ["py_q_list_index"],
  func: ["py_q_def_func", "py_q_return", "py_q_tf_indent"],
  ptr: [], // Python 入门不涉及指针
};

// --- 3. 关卡配置：每关用哪些知识点标签 ---
// 为了降低每个部分的知识点数量，这里控制大多数关卡只聚焦 1 个主标签，
// 通过多关重复练习来巩固，最后一部分再做综合挑战。
const lessonConfigs: Record<string, string[]> = {
  // 1-12：输出相关 —— 全部只练 output
  "1": ["output"],
  "2": ["output"],
  "3": ["output"],
  "4": ["output"],
  "5": ["output"],
  "6": ["output"],
  "7": ["output"],
  "8": ["output"],
  "9": ["output"],
  "10": ["output"],
  "11": ["output"],
  "12": ["output"],

  // 13-24：变量与类型 —— 聚焦 vars
  "13": ["vars"],
  "14": ["vars"],
  "15": ["vars"],
  "16": ["vars"],
  "17": ["vars"],
  "18": ["vars"],
  "19": ["vars"],
  "20": ["vars"],
  "21": ["vars"],
  "22": ["vars"],
  "23": ["vars"],
  "24": ["vars"],

  // 25-30：表达式与算术运算 —— 聚焦 math
  "25": ["math"],
  "26": ["math"],
  "27": ["math"],
  "28": ["math"],
  "29": ["math"],
  "30": ["math"],

  // 31-36：条件判断 —— 聚焦 logic
  "31": ["logic"],
  "32": ["logic"],
  "33": ["logic"],
  "34": ["logic"],
  "35": ["logic"],
  "36": ["logic"],

  // 37-42：循环相关 —— 聚焦 loop
  "37": ["loop"],
  "38": ["loop"],
  "39": ["loop"],
  "40": ["loop"],
  "41": ["loop"],
  "42": ["loop"],

  // 43-48：函数入门 —— 聚焦 func
  "43": ["func"],
  "44": ["func"],
  "45": ["func"],
  "46": ["func"],
  "47": ["func"],
  "48": ["func"],

  // 49-54：指针初体验 —— 聚焦 ptr
  "49": ["ptr"],
  "50": ["ptr"],
  "51": ["ptr"],
  "52": ["ptr"],
  "53": ["ptr"],
  "54": ["ptr"],

  // 55-60：综合与挑战 —— 适当混合所有已学知识
  "55": ["output", "vars", "math"],
  "56": ["output", "vars", "logic"],
  "57": ["loop", "func"],
  "58": ["loop", "func", "vars"],
  "59": ["output", "vars", "logic", "loop", "func"],
  "60": ["output", "vars", "logic", "loop", "func", "ptr"],
};

// --- 4. 课程结构：每关只存元信息，具体题目由 getQuestionsForLesson 动态生成 ---
export const course: Course = {
  id: "c-language",
  name: "C 语言入门",
  stages: [
    {
      id: "stage-1",
      title: "第 1 阶段：基础语法",
      lessons: lessonTitles.map((title, index) => ({
        id: String(index + 1),
        title,
        questionIds: [], // 不再写死题目 ID，由 getQuestionsForLesson 决定
      })),
    },
  ],
};

// Java 课程结构：与 C 语言保持相同的关卡划分与 lesson 数量
export const javaCourse: Course = {
  id: "java-language",
  name: "Java 入门",
  stages: [
    {
      id: "stage-1",
      title: "第 1 阶段：基础语法（Java）",
      lessons: lessonTitles.map((title, index) => ({
        id: String(index + 1),
        title,
        questionIds: [],
      })),
    },
  ],
};

// Python 课程结构
export const pythonCourse: Course = {
  id: "python-language",
  name: "Python 入门",
  stages: [
    {
      id: "stage-1",
      title: "第 1 阶段：基础语法（Python）",
      lessons: lessonTitles.map((title, index) => ({
        id: String(index + 1),
        title,
        questionIds: [],
      })),
    },
  ],
};

// 第一阶段扩展为 10 个部分：
// - 第 1 部分固定 4 关
// - 其余部分为 6 或 8 关（偶数），中间都可以插宝箱
// 总计 60 关。
export const parts: Part[] = [
  // 输出：1-4
  { id: "part-1", title: "输出入门 1", color: "#58cc02", lessonIds: ["1", "2", "3", "4"] },
  // 输出：5-12（8 关）
  { id: "part-2", title: "输出入门 2", color: "#1cb0f6", lessonIds: ["5", "6", "7", "8", "9", "10", "11", "12"] },
  // 变量：13-18（6 关）
  { id: "part-3", title: "变量入门 1", color: "#ff78ca", lessonIds: ["13", "14", "15", "16", "17", "18"] },
  // 变量：19-24（6 关）
  { id: "part-4", title: "变量入门 2", color: "#ffc800", lessonIds: ["19", "20", "21", "22", "23", "24"] },
  // 表达式：25-30（6 关）
  { id: "part-5", title: "表达式基础", color: "#a855f7", lessonIds: ["25", "26", "27", "28", "29", "30"] },
  // 条件：31-36（6 关）
  { id: "part-6", title: "条件判断", color: "#ff4b4b", lessonIds: ["31", "32", "33", "34", "35", "36"] },
  // 循环：37-42（6 关）
  { id: "part-7", title: "循环入门", color: "#2b70c9", lessonIds: ["37", "38", "39", "40", "41", "42"] },
  // 函数：43-48（6 关）
  { id: "part-8", title: "函数入门", color: "#00b894", lessonIds: ["43", "44", "45", "46", "47", "48"] },
  // 指针：49-54（6 关）
  { id: "part-9", title: "指针入门", color: "#fd9644", lessonIds: ["49", "50", "51", "52", "53", "54"] },
  // 综合：55-60（6 关）
  { id: "part-10", title: "综合挑战", color: "#9b59b6", lessonIds: ["55", "56", "57", "58", "59", "60"] },
];

export function getStage1LessonById(lessonId: string): Lesson | undefined {
  return course.stages[0].lessons.find((l) => l.id === lessonId);
}

export function getJavaStage1LessonById(lessonId: string): Lesson | undefined {
  return javaCourse.stages[0].lessons.find((l) => l.id === lessonId);
}

export function getPythonStage1LessonById(lessonId: string): Lesson | undefined {
  return pythonCourse.stages[0].lessons.find((l) => l.id === lessonId);
}

// --- 5. 原子题库调度：根据标签动态为每关挑题 ---
// 默认每关抽题数量随关卡递增，前期更轻松，后期题量更多，形成类似多邻国的难度曲线。
function getQuestionsForLessonInternal(
  lessonId: string,
  count: number,
  tagsMap: Record<string, string[]>,
  questionsMap: Record<string, Question>
): Question[] {
  const tags = lessonConfigs[lessonId] ?? ["output"];

  // 根据关卡编号调整目标题量：前面关卡题目更少、更多重复，后面逐步增加题目数量。
  let desiredCount = count;
  const idNum = Number(lessonId);
  if (!Number.isNaN(idNum) && count >= 10) {
    if (idNum <= 4) {
      // 第 1 部分：入门体验，题目少一些
      desiredCount = 8;
    } else if (idNum <= 12) {
      // 输出相关后半段：逐步加到 10 题
      desiredCount = 10;
    } else if (idNum <= 24) {
      // 变量与类型：12 题，重复巩固
      desiredCount = 12;
    } else if (idNum <= 36) {
      // 表达式和条件：14 题
      desiredCount = 14;
    } else if (idNum <= 54) {
      // 循环、函数、指针：16 题
      desiredCount = 16;
    } else {
      // 综合挑战部分：18 题
      desiredCount = 18;
    }
  }

  // 1) 聚合所有关联标签下的题目 ID
  const idSet = new Set<string>();
  for (const tag of tags) {
    const ids = tagsMap[tag];
    if (!ids) continue;
    ids.forEach((id) => idSet.add(id));
  }

  // 2) 去重 + 打乱
  const allIds = Array.from(idSet);
  const shuffled = allIds.sort(() => Math.random() - 0.5);

  // 3) 映射为题目对象
  let result: Question[] = shuffled
    .map((id) => questionsMap[id])
    .filter((q): q is Question => Boolean(q));

  // 4) 如果数量不足，使用 output 池补齐，仍然保证不重复
  if (result.length < count) {
    const fillerIds = (tagsMap["output"] ?? []).filter((id) => !idSet.has(id));
    const filler = fillerIds
      .map((id) => questionsMap[id])
      .filter((q): q is Question => Boolean(q));
    result = result.concat(filler);
  }

  // 最终按关卡难度曲线截断题量
  return result.slice(0, desiredCount);
}

// C 语言：保持原有导出签名不变
export function getQuestionsForLesson(lessonId: string, count = 10): Question[] {
  return getQuestionsForLessonInternal(lessonId, count, TAGS, questions);
}

// Java：与 C 语言相同的关卡结构与题量曲线
export function getQuestionsForLessonJava(lessonId: string, count = 10): Question[] {
  return getQuestionsForLessonInternal(lessonId, count, JAVA_TAGS, javaQuestions);
}

// Python：与 C 语言相同的关卡结构与题量曲线
export function getQuestionsForLessonPython(lessonId: string, count = 10): Question[] {
  return getQuestionsForLessonInternal(lessonId, count, PY_TAGS, pythonQuestions);
}