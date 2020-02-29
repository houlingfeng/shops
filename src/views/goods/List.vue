<template>
    <div>
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!--卡片视图区域-->
         <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>

            <!--table表格区域-->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                    <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showShop(scope.row.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--分页区域-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
         </el-card>

         <!--编辑框-->
        <el-dialog title="商品修改" :visible.sync="listDialogVisible" width="50%" @close="listDiglogClosed">
            <el-form :model="listForm" :rules="listFormRules" ref="listFormRef" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="listForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="goods_price">
                    <el-input v-model="listForm.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="数量" prop="goods_number">
                    <el-input v-model="listForm.goods_number" type="number"></el-input>
                </el-form-item>
                <el-form-item label="重量" prop="goods_weight">
                    <el-input v-model="listForm.goods_weight" type="number"></el-input>
                </el-form-item>
            </el-form>


            <span slot="footer" class="dialog-footer">
                <el-button @click="listDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addlist">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default{
        data(){
            return {
                //查询参数对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                //总数据条数
                total: 0,
                //商品列表
                goodslist: [],
                listDialogVisible: false,
                listForm: {},
                listFormRules: {
                    goods_name: [{required: true, message: "请输入商品名称", trigger: 'blur'}],
                    goods_price: [{required: true, message: "请输入商品价格", trigger: 'blur'}],
                    goods_number: [{required: true, message: "请输入商品数量", trigger: 'blur'}],
                    goods_weight: [{required: true, message: "请输入商品重量", trigger: 'blur'}]
                },
                catelist: []
            }
        },
        created(){
            this.getGoodsList()
        },
        methods: {
            //根据分页获取对应的商品列表
            async getGoodsList(){
                //get方法都要指定params参数
                const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.$message.success('获取成功')
                console.log(res.data)
                this.goodslist = res.data.goods
                this.total = res.data.total
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize
                this.getGoodsList()
            },
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            async removeById(id){
                //弹框提示是否删除
                const confirmResult = await this.$confirm('此操作将永久删除该商品，是否继续？', '提示', {
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
                const {data: res} = await this.$http.delete(`goods/${id}`)
                if(res.meta.status !== 200){
                    return this.$message.error('删除失败')
                }
                console.log(res)
                this.$message.success('删除成功')
                //id = res.data
                this.getGoodsList()
            },
            goAddpage(){
                this.$router.push('/goods/add')
            },
            //编辑
            async showShop(goods_id){
                const {data: res} = await this.$http.get('goods/' + goods_id)
                if(res.meta.status !== 200){
                    return this.$message.error('获取失败')
                }
                this.$message.success('获取成功')
                this.listForm = res.data
                console.log(this.listForm)
                this.listDialogVisible = true
            },
            addlist(){
                this.$refs.listFormRef.validate(async valid => {
                    if(!valid) return
                    const {data: res}= await this.$http.put('goods/' + this.listForm.goods_id, {goods_name: this.listForm.goods_name, goods_price: this.listForm.goods_price, goods_weight: this.listForm.goods_weight, goods_number: this.listForm.goods_number, goods_cat: this.listForm.goods_cat})
                    if(res.meta.status !== 200){
                        return this.$message.error('修改失败')
                    }
                    this.$message.success('修改成功')
                    console.log(res)
                    this.getGoodsList()
                    this.listDialogVisible = false
                })
            },
            listDiglogClosed(){
                this.$refs.listFormRef.resetFields()
            }
        }
    }
</script>

<style lang="less" scoped></style>