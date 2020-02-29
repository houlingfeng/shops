<template>
    <div>
         <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--卡片视图区域-->
        <el-card>
            <!--警告区域-->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>

            <!--选择商品分类区域-->
            <el-row class="cat-opt">
                <el-col>
                    <span>选择商品分类：</span>

                    <!--选择商品分类的级联选择框-->
                    <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="selectedCatekeys" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!--tab区域-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!--添加动态参数的面板-->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>


                    <!--动态参数表格-->
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>


                <!--添加静态参数的面板-->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>

                    <!--静态参数表格-->
                    <el-table :data="onlyTableDate" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!--添加参数的对话框-->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormrRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" calss="dialog-footer">
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addParams">确定</el-button>
            </span>
        </el-dialog>


        <!--修改参数的对话框-->
        <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormrRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" calss="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="editParams">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default{
        data(){
            return {
                //商品分类列表
                catelist: [],
                //级联选择框的配置对象
                cateProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                //级联选择框的双向绑定到的数组
                selectedCatekeys: [],
                //被激活的页签的名称
                activeName: 'many',
                //动态参数数据
                manyTableData: [],
                //静态参数数据
                onlyTableDate: [],
                //控制添加对话框的显示与隐藏
                addDialogVisible: false,
                //添加参数的表单数据对象
                addForm: {
                    attr_name: ''
                },
                //添加表单的验证规则对象
                addFormRules: {
                    attr_name:[{required: true, message: '请输入参数名称', trigger: 'blur'}]
                },
                //控制修改对话框的显示与隐藏
                editDialogVisible: false,
                editForm: {},
                editFormRules: {
                    attr_name:[{required: true, message: '请输入参数名称', trigger: 'blur'}]
                }

            }
        },
        created(){
            this.getCateList()
        },
        methods: {
            //获取所有商品的列表
            async getCateList(){
                const {data: res} = await this.$http.get('categories')
                if(res.meta.status !== 200 ){
                    return this.$message.error('获取失败')
                }
                this.catelist = res.data
                console.log(this.catelist)

            },
            //级联选择框选中项变化，会触发这个函数
            handleChange(){
                this.getParamsData()
            },

            //这是tab页签点击事件的处理函数
            handleTabClick(){
                console.log(this.activeName)
                this.getParamsData()
            },
            //获取参数的列表数据
            async getParamsData(){
                //证明选择的不是三级分类
                if(this.selectedCatekeys.length !== 3){
                    this.selectedCatekeys = []
                    this.manyTableData = []
                    this.onlyTableDate = []
                    return
                }
                //选择的是三级分类
                console.log(this.selectedCatekeys)
                //根据所选分类的id和当前所处的面板获取对应的参数
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                console.log(res.data)
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                    //控制文本框的显示与隐藏
                    item.inputVisible = false
                    //文本框输入的值
                    item.inputValue = ''
                })
                console.log(res.data)
                if(this.activeName === 'many'){
                    this.manyTableData = res.data
                }else{
                    this.onlyTableDate = res.data
                }
            },
            //监听对话框的关闭事件
            addDialogClosed(){
                this.$refs.addFormrRef.resetFields()
            },
            //点击按钮添加参数
            addParams(){
                this.$refs.addFormrRef.validate(async valid => {
                    if(!valid) return
                    const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if(res.meta.status !== 201){
                        return this.$message.error('添加失败')
                    }
                    this.$message.success('添加成功')
                    this.addDialogVisible = false
                    this.getParamsData()

                })
            },
            //点击按钮展示修改对话框
            async showEditDialog(attr_id){
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.editForm = res.data
                this.editDialogVisible = true
            },
            editDialogClosed(){
                this.$refs.editFormrRef.resetFields()
            },
            editParams(){
                this.$refs.editFormrRef.validate(async valid => {
                    if(!valid) return
                    const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
                    if(res.meta.status !== 200){
                        return this.$message.error('修改失败')
                    }
                    this.$message.success('修改成功')
                    this.getParamsData()
                    this.editDialogVisible = false
                })
            },
            async removeParams(attr_id){
                //弹框提示是否删除
                const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                //如果用户确认删除则返回字符串confirm
                //如果用户取消删除则返回字符串cancel
                console.log(confirmResult)
                if(confirmResult !== 'confirm'){
                    return this.$message.info('已取消删除')
                }
                const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
                if(res.meta.status !== 200){
                    return this.$message.error('删除失败')
                }
                console.log(res)
                this.$message.success('删除成功')
                //id = res.data
                this.getParamsData()
            },
            //文本框触发事件
            async handleInputConfirm(row){
                if(row.inputValue.trim().length === 0){
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                }
                //对需要保存的内容做后续处理
                console.log('ok')
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue = ''
                row.inputVisible = false

                //保存到数据库
                this.saveAttrVals(row)
            },
            //将对attr_vals的操作保存到数据库
            async saveAttrVals(row){
                //保存到数据库
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ')})
                if(res.meta.status !== 200){
                    return this.$message.error('修改失败')
                }
                this.$message.success('修改成功')
            },
            showInput(row){
                row.inputVisible = true
                //让文本框自动获得焦点
                //$nextTick方法的作用是当页面元素被重新渲染之后才会指定回调函数中的代码
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus()
                })
            },
            //删除对应的参数可选项
            handleClose(i, row){
                row.attr_vals.splice(i, 1)
                this.saveAttrVals(row)

            }
        },
        computed: {
            //如果按钮需要被禁止使用则返回true
            isBtnDisabled(){
                if(this.selectedCatekeys.length !== 3){
                    return true
                }
                return false
            },
            //当前选择的三级分类的id
            cateId(){
                if(this.selectedCatekeys.length === 3){
                    return this.selectedCatekeys[2]
                }
                return null
            },
            //动态计算标题的文本
            titleText(){
                if(this.activeName === 'many'){
                    return '动态参数'
                }
                return '静态属性'
            }
        }

    }
</script>

<style lang="less" scoped>
    .cat-opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag{
        width: 120px;
    }
</style>