import { Converter } from 'typedoc';
import { MarkdownPageEvent, MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

export function load(app) {
  // 注册 @demo 自定义块标签
  app.converter.on(Converter.EVENT_BEGIN, () => {
    const current = app.options.getValue('blockTags');
    if (!current.includes('@demo')) {
      app.options.setValue('blockTags', [...current, '@demo']);
    }
  });

  // 在转换阶段过滤构造函数
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (context, reflection) => {
    if (
      reflection.kindString === 'Constructor' // 根据 kindString 判断
      || reflection.name === 'constructor' // 或根据名称判断
    ) {
      reflection.flags.setFlag('exclude', true); // 标记为排除
      context.project.removeReflection(reflection); // 主动移除
    }
  });
  app.renderer.on(MarkdownPageEvent.END, page => {
    page.contents = page.contents.replace(/## Default/g, '## 默认值');
    page.contents = page.contents.replace(/## Usage/g, '## 用法');
    page.contents = page.contents.replace(/## Deprecated/g, '## 已弃用');
    page.contents = page.contents.replace(/## Example/g, '## 示例');
    page.contents = page.contents.replace(/#### Type Parameters/g, '#### 类型参数');
    page.contents = page.contents.replace(/\| Type parameter \|/g, '| 类型参数 |');
    page.contents = page.contents.replace(/#### Parameters/g, '#### 参数');
    page.contents = page.contents.replace(/Parameter/g, '参数名');
    page.contents = page.contents.replace(/Type/g, '类型');
    page.contents = page.contents.replace(/Default value/g, '默认值');
    page.contents = page.contents.replace(/Description/g, '描述');

    page.contents = page.contents.replace(/#### Returns/g, '#### 返回值类型');
    page.contents = page.contents.replace(/#### Inherited from/g, '#### 继承自');

    page.contents = page.contents.replace(/#### Example/g, '#### 示例');

    // 四级标题的默认值/示例 + 多行代码块 -> 加粗 + 单行代码块
    // 默认值：加粗加冒号 + 单行代码块
    page.contents = page.contents.replace(/#### 默认值\n\n```\w*\n([^\n]+)\n```/g, '**默认值：** `$1`');
    // 示例：加粗加冒号，代码块保持多行
    page.contents = page.contents.replace(/#### 示例/g, '**示例：**');

    // 已弃用属性：标题加红色徽章，移除底部已弃用描述块
    page.contents = page.contents.replace(/#### Deprecated/g, '#### 已弃用');
    {
      const sections = page.contents.split('\n\n***\n\n');
      page.contents = sections.map(section => {
        if (!section.includes('#### 已弃用'))
          return section;
        section = section.replace(/^(### [^\n]+)/m, '$1 <Badge type="danger" text="已弃用" />');
        section = section.replace(/\n\n#### 已弃用[\s\S]*/, '');
        return section;
      }).join('\n\n***\n\n');
    }

    page.contents = page.contents.replace(/## Extends\n\n- .+\n\n/g, '');
    page.contents = page.contents.replace(/## Properties/g, '');
    page.contents = page.contents.replace(/## Methods/g, '## 方法');
    page.contents = page.contents.replace(/## Enumeration Members/g, '');

    // 可选属性标题：### name? -> ### name（可选）
    page.contents = page.contents.replace(/^### (\S+)\?$/gm, '### $1（可选）');

    // 剩余四级标题统一转为加粗加冒号
    page.contents = page.contents.replace(/^#### (.+)$/gm, '**$1：**');

    // 将 @demo 标题标签映射为"案例"
    page.contents = page.contents.replace(/\*\*Demo：\*\*/g, '**案例：**');

    // 单行代码块转为内联代码
    page.contents = page.contents.replace(/```\w*\n([^\n]+)\n```/g, '`$1`');
    // 内联代码紧跟在 label 冒号后面，不独占一行
    page.contents = page.contents.replace(/(\*\*[^*\n]+：\*\*)\n\n(`[^`\n]+`)/g, '$1 $2');

    page.contents = page.contents.replace('[`MotionPreload`](../enumerations/MotionPreload.md)', '[`MotionPreload`](../../guide/motion/index.md)');
    page.contents = page.contents.replace(/\[`Emits`\]\(\.\.\/interfaces\/Emits\.md\)/g, '[`Emits`](../../guide/model/event.md)');
    page.contents = page.contents.replace(/\[`L2DEventMap`\]\((?:\.\.\/interfaces\/)?L2DEventMap\.md\)/g, '[`L2DEventMap`](../../guide/model/event.md)');
    // switch (page.model.name) {
    //   case 'Options':
    //     page.contents = page.contents.replace(/## Properties/g, '');
    //     break;
    //   default:
    //     page.contents = page.contents.replace(/## Properties/g, '## 选项');
    //     break;
    // }
  });

  app.renderer.defineTheme('themeExpand', MyMarkdownTheme);
}

class MyMarkdownTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new MyMarkdownThemeContext(this, page, this.application.options);
  }
}

class MyMarkdownThemeContext extends MarkdownThemeContext {
  // customise partials
  partials = {
    ...this.partials,
    pageTitle: () => {
      switch (this.page.model.name) {
        case 'MenusOptions':
          return '菜单选项';
        case '# Options':
          return '';
        case 'StatusBarOptions':
          return '状态条选项';
        case 'TipsOptions':
          return '提示框选项';
        case 'ModelOptions':
          return '模型选项';
        case 'loadOml2d':
          return '组件加载';
        case 'Oml2dProperties':
          return '实例对象中的属性';
        case 'Oml2dMethods':
          return '实例对象中的方法';
        case 'Oml2dEvents':
          return '实例对象中的事件';
        default:
          return '';
      }
    }
  };
}
