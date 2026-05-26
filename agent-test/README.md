### 1.0
#### 1 init Agent 

![alt text](./image/image-4.png)
![为了测试这个东西，我只想执行一个文件，应该怎么告诉他  ](./image/image-5.png)
![alt text](./image/image-6.png)
去抄
![alt text](./image/image-7.png)
用抄到到的知识，生成自己的模板
![alt text](./image/image-8.png)

#### 2. 添加功能 优化 UI
 添加排序 上一个版本和当前版本差异 每个文件都有详情页面（展示两个， 一个是未覆盖代码， 一个差异代码 ）代码量太大添加展开折叠（默认折叠
添加详情， 
![在下面增加详情，File Statements Δ Status](./image/image-9.png)
增加描述， 修改bug
![Statements 应该是上一次到这一次的变化 比如 1% -> 10%, 再加一列 差集 Δ是一个排序功能](./image/image-10.png)
给行添加点击事件让数据详细到每一个文件
![给行添加点击事件让数据详细到每一个文件](./image/image-11.png)
将他们的数据也按照这个格式映射下去，不是直接进去到那个页面 ， 再 File Details 下增加一个 面包屑导航栏， 可以点击返回的那种
![将他们的数据也按照这个格式映射下去，不是直接进去到那个页面 ， 再 File Details 下增加一个 面包屑导航栏， 可以点击返回的那种-](./image/image-12.png)
点到最后一层的时候把差异代码展示出来
![点到最后一层的时候把差异代码展示出来](./image/image-13.png)
下面再添加一个代码块， 如果上一次和本次覆盖率不一样，展示那些代码有差异，
![下面再添加一个代码块， 如果上一次和本次覆盖率不一样，展示那些代码有差异，](./image/image-14.png)
动态切换展开和收起
![动态切换展开和收起](./image/image-15.png)
#### [👉 第一版本 结束](./html/1.html)
唯一亮点， 能看到 两次 code coverage 产生差异的代码
![alt text](./image/image-16.png) 
#### 3. 问 Claude Code 对比两次 code coverage 数据，有那些比较重要的数据需要展示出来
![alt text](./image/image-18.png)
给 stats-row 添加上次覆盖率 还有差异 UI 类似这样 变化量用颜色区分涨跌

添加 Summary 行 包含 
  - 几个模块覆盖率提升 
  - 几个下降 
  - 几个低于阈值（80%） 
  - 新增多少行代码， 
  - 已覆盖多少 
（Summary 是可点击的，点击 更新 File Details 展示 每个块的筛选数据

添加各维度变化趋势 柱形图
![alt text](./image/image-17.png)
#### [👉 添加新功能](./html/2.html)
1. 新增差异
![alt text](./image/image-19.png)
![alt text](./image/image-20.png)
![alt text](./image/image-21.png)

#### 并行执行测试 
Run quarterly coverage review and generate difference report. `specPath` `parallel`
修改当前Agent 如果全量跑或者超过两个space 需要有一个 并行跑，然后再合并数据的 添加一个 并行数的参数 支持并行
![alt text](./image/image-25.png)

#### 4. 优化JS 执行命令
 初代的执行方法这个样子， 后面传了文件名 ， 给他默认文件名， 没传显示 all-specs， 可以直接使用 node ./.github/skills/coverage-report/scripts/reporter.js 生成 Diff Html
node -e "var r=require('./.github/skills/coverage-report/scripts/reporter.js'); r.run({specLabel:'journey_sequence_sunburst_code_cover_age_spec.js'})" 2>&1

#### 优化 Agent
我看到这个 agent 在执行过程中还是会自动生成代码，是否可以将这些代码封装在 coverage-report Skill 中 直接调用，加快Agent 执行速度
![alt text](./image/image-24.png)
![alt text](./image/image-22.png)
xcopy/cp 产生大量的操作，感觉会影响性能  ，
![alt text](./image/image-23.png)

#### 缓存问题
添加清空 modeInstructions 缓存方法
![alt text](./image/image-26.png)

#### 5 创建 Github Actions 运行 Copilot Agent
 因为 没了解 Copilot 怎么在 CI 中运行，使用 Github Actions 运行，生成了 Github Actions 脚本（未测试

![当前这个agent 需要使用 GitHub Actions 每个季度去跑一次， 请生成对应的配置文件](./image/image-2.png)
![alt text](./image/image-3.png)

#### 6 CI 中 生成 Diff HTML
 可以直接用 reporter.js 对比两个结果，在coverage 结果上传 S3 前运行reporter.js ，生成Diff HTML ,一起上传到 S3 
![阅读这个文件 ， 执行 code coverage 的时候， 是否会存在 previous_results lcov-report 这两个文件， code coverage 结果上传 S3 前， 是否可以执行， .github/SKILL/coverage-report/scripts/reporter.js 来生成diff html 并一起上传到 S3](./image/image.png)
![alt text](./image/image-1.png)
