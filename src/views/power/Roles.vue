<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--卡片视图-->
        <el-card>
            <!--添加角色按钮区域-->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表-->
            <el-table :data="rolelist" border stripe>
                <!--展开列-->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                             <!--渲染一级权限-->
                             <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                             </el-col>

                            <!--渲染二级三级权限-->
                            <el-col :span="19">
                                <!--通过for循环嵌套渲染二级权限-->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!--索引列-->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope='scope'>
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--添加用户的对话框-->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!--内容主体-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addUser">确定</el-button>
            </span>
        </el-dialog>



        <!--修改用户的对话框-->
        <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDiglogClosed">
            <!--内容主体-->
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色名称">
                    <el-input v-model="editForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="editUserInfo">确定</el-button>
            </span>
        </el-dialog>

        <!--分配权限的对话框-->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed"> 
            <!--树形控件-->
            <el-tree :data="rightslists" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="allotRights">确认</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default{
        data(){
            return {
                //所有角色列表数据
                rolelist: [],
                addDialogVisible: false,
                addForm: {
                    roleName:'',
                    roleDesc: ''
                },
                addFormRules:{
                    roleName: [
                        {required: true, message: '请输入角色名', trigger: 'blur'},
                        {min: 2, max: 5, message: '角色名的长度在2到5位', trigger: 'blur'}
                    ],
                    roleDesc: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'},
                        {min: 3, max: 20, message: '角色描述的长度在3到20位', trigger: 'blur'}
                    ]
                },
                //控制修改用户对话框的显示于隐藏
                editDialogVisible: false,
                //查询到的用户信息
                editForm:{},
                //控制分配权限的显示和隐藏
                setRightDialogVisible: false,
                //所有权限的数据
                rightslists: [],
                //树形控件的属性绑定对象
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                //默认选择的节点id数组
                defKeys: [],
                //当前即将分配权限角色的id
                roleId: ''
            }
        },
        created(){
            this.getRolesList()
        },
        methods: {
            //获取所有角色的列表
            async getRolesList(){
                const {data: res} = await this.$http.get('roles')
                if(res.meta.status !== 200){
                    return this.$message.error('获取角色列表失败')
                }
                this.rolelist = res.data
                console.log(this.rolelist)
            },
            //根据id删除对应的权限
            async removeRightById(role, rightId){
                //弹框提示删除
                const confirmResult = await this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warnning'
                }).catch(err => err)
                if(confirmResult !== 'confirm'){
                    return this.$message.info('取消了删除')
                }
                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status !== 200){
                    return this.$message.error('删除权限失败')
                }
                this.$message.success('删除权限成功')
                //this.getRolesList()
                role.children = res.data
            },
            //监听添加用户框的关闭事件
            addDialogClosed(){
                //resetFields函数用来重置表单输入框
                this.$refs.addFormRef.resetFields()
                console.log(this.$refs.addFormRef)
            },
            addUser(){
                //表单预校验函数validata 返回一个布尔值 valid
                this.$refs.addFormRef.validate(async valid => {
                    console.log(valid)
                    if(!valid) return
                    //可以发起添加用户的请求
                    const {data: res} = await this.$http.post('roles', this.addForm)
                    if(res.meta.status !== 201) {
                        this.$message.error('添加用户失败')
                    }
                    this.$message.success('添加用户成功')
                    //隐藏添加框
                    this.addDialogVisible = false
                    //刷新列表
                    this.getRolesList()
                })
            },
            //展示编辑用户的对话框
            async showEditDialog(row){
                console.log(row.roleName)
                const {data: res} = await this.$http.get('roles/' + row.id)
                console.log(res)
                if(res.meta.status !== 200){
                    return this.$message.error('获取用户信息失败')
                }
                this.editForm = res.data
                this.editDialogVisible = true
            },
            //监听用户修改的对话框
            editDiglogClosed(){
                this.$refs.editFormRef.resetFields()

            },
            //修改用户信息并提交
            editUserInfo(){
                this.$refs.editFormRef.validate(async valid => {
                    if(!valid) return

                    const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc})

                    if(res.meta.status !== 200){
                        return this.$message.error('修改用户信息失败')
                    }
                    this.editDialogVisible = false
                    this.getRolesList()
                    this.$message.success('修改用户信息成功')
                }) 
            },
            //根据id删除对应的用户信息
            async removeUserById(id){
                //弹框提示是否删除
                const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
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
                const {data: res} = await this.$http.delete('roles/' + id)
                if(res.meta.status !== 200){
                    return this.$message.error('删除用户失败')
                }
                this.$message.success('删除用户成功')
                this.getRolesList()
            },
            //展示分配权限的对话框
            async showSetRightDialog(role){
                this.roleId = role.id
                //获取所有权限的数据
                const {data: res} = await this.$http.get('rights/tree')
                if(res.meta.status !== 200){
                    return this.$message.error('获取权限数据失败')
                }
                //把获取的其权限数据保存到data中
                this.rightslists = res.data
                console.log(this.rightslists)
                //递归获取三级角色的id
                this.getLeafKeys(role, this.defKeys)
                this.setRightDialogVisible = true
            },

            
            //通过递归的形式获取角色下所有三级权限的id并且保存到defkeys数组中
            getLeafKeys(node, arr){
                //如果当前node节点不包含children属性，则是三级节点
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item => this.getLeafKeys(item, arr))
            },
            //监听分配权限对话框的关闭事件
            setRightDialogClosed(){
                this.defKeys = []
            },
            //点击为角色分配权限
            async allotRights(){
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                console.log(keys)
                const idStr = keys.join(',')
                const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
                if(res.meta.status !== 200){
                    return this.$message.error('分配权限失败')
                }
                this.$message.success('分配权限成功')
                this.getRolesList()
                this.setRightDialogVisible = false
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop{
        border-top: 1px solid #eee;
    }
    .bdbottom{
        border-bottom: 1px solid #eee;
    }
    .vcenter{
        display: flex;
        align-items: center;
    }
</style>