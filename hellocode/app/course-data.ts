export type QuestionType = "sort" | "order";

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

export type Question = SortQuestion | OrderQuestion;

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
  "认识 C 语言", "第一个程序", "打印问候语", "输出数字", "练习：姓名",
  "变量入门", "整数类型", "浮点数", "字符与字符串", "声明练习",
  "输入输出综合", "算术运算", "优先级", "计算总分", "if 入门",
  "if-else 结构", "多重 if", "while 入门", "求和练习", "for 入门",
  "break/continue", "循环综合", "数组基础", "数组遍历", "函数入门",
  "带参函数", "返回值", "加法函数", "指针初体验", "地址概念",
  "小项目", "终极挑战"
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
    codeTemplate: [{ type: "text", value: "char a = " }, { type: "blank", id: "s1" }, { type: "text", value: "x" }, { type: "blank", id: "s2" }, { type: "text", value: ";" }],
    options: [{ id: "o1", label: "'" }, { id: "o2", label: '"' }, { id: "o3", label: "`" }],
    correctByBlank: { "s1": "o1", "s2": "o1" }
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
    correctByBlank: { "s1": "o1" }
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
    correctByBlank: { "s1": "o1" }
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
  }
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
  ],
  // 数组
  array: ["q_arr_declare", "q_arr_index", "q_loop_array", "q_for_arr"],
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

// --- 3. 关卡配置：每关用哪些知识点标签 ---
const lessonConfigs: Record<string, string[]> = {
  "1": ["output"],
  "2": ["output"],
  "3": ["output"],
  "4": ["output"],
  "5": ["output"],
  "6": ["vars", "output"], // 开始混合旧知识复习
  "7": ["vars"],
  "8": ["vars"],
  "9": ["vars"],
  "10": ["vars"],
  "11": ["vars", "output"],
  "12": ["math", "vars"],
  "13": ["math"],
  "14": ["math"],
  "15": ["logic"],
  "16": ["logic"],
  "17": ["logic", "vars"],
  "18": ["loop"],
  "19": ["loop", "math"],
  "20": ["loop"],
  "21": ["loop"],
  "22": ["loop", "array"],
  "23": ["array"],
  "24": ["array", "loop"],
  "25": ["func"],
  "26": ["func"],
  "27": ["func"],
  "28": ["func", "math"],
  "29": ["ptr"],
  "30": ["ptr", "vars"],
  "31": ["output", "vars", "logic", "loop", "func"], // 综合关
  "32": ["output", "vars", "logic", "loop", "func", "ptr"], // 挑战关
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

export const parts: Part[] = [
  { id: "part-1", title: "输出入门", color: "#58cc02", lessonIds: ["1", "2", "3", "4", "5"] },
  { id: "part-2", title: "变量与类型", color: "#1cb0f6", lessonIds: ["6", "7", "8", "9", "10", "11"] },
  { id: "part-3", title: "表达式与条件", color: "#ff78ca", lessonIds: ["12", "13", "14", "15", "16", "17"] },
  { id: "part-4", title: "循环与数组", color: "#ffc800", lessonIds: ["18", "19", "20", "21", "22", "23", "24"] },
  { id: "part-5", title: "函数与进阶", color: "#a855f7", lessonIds: ["25", "26", "27", "28", "29", "30", "31", "32"] },
];

export function getStage1LessonById(lessonId: string): Lesson | undefined {
  return course.stages[0].lessons.find((l) => l.id === lessonId);
}

// --- 5. 原子题库调度：根据标签动态为每关挑题 ---
export function getQuestionsForLesson(lessonId: string, count = 5): Question[] {
  const tags = lessonConfigs[lessonId] ?? ["output"];

  // 1) 聚合所有关联标签下的题目 ID
  const idSet = new Set<string>();
  for (const tag of tags) {
    const ids = TAGS[tag];
    if (!ids) continue;
    ids.forEach((id) => idSet.add(id));
  }

  // 2) 去重 + 打乱
  const allIds = Array.from(idSet);
  const shuffled = allIds.sort(() => Math.random() - 0.5);

  // 3) 映射为题目对象
  let result: Question[] = shuffled
    .map((id) => questions[id])
    .filter((q): q is Question => Boolean(q));

  // 4) 如果数量不足，使用 output 池补齐，仍然保证不重复
  if (result.length < count) {
    const fillerIds = (TAGS["output"] ?? []).filter((id) => !idSet.has(id));
    const filler = fillerIds
      .map((id) => questions[id])
      .filter((q): q is Question => Boolean(q));
    result = result.concat(filler);
  }

  // 最终保证每关 3–5 道题，这里按调用方的 count 截断
  return result.slice(0, count);
}