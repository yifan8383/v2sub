<script setup>
document.title = '管理面板'

import { Refresh, Plus, DArrowRight } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SourceEditor from '@/components/SourceEditor.vue'

const loading = ref(false)
const showEditor = ref(false)
const subNames = ref([])
const router = useRouter()

const sourceData = reactive({
    name: '',
    url: '',
    exclude: ''
})

const subSecretData = reactive({
    secret: ''
})

const doLogout = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/auth/logout')

        ElMessage.success(res.data)
        router.push({ name: 'login' })
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const fetchSubNames = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/source/list')
        subNames.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addSource = () => {
    Object.assign(sourceData, {
        name: '',
        url: '',
        exclude: ''
    })

    openEditor()
}

const editSource = async idx => {
    const name = subNames.value[idx]

    try {
        loading.value = true
        const res = await axios.get(`/api/source/info?name=${name}`)

        const { url, exclude } = res.data
        Object.assign(sourceData, { name, url, exclude })
        openEditor()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteSource = async idx => {
    const name = subNames.value[idx]

    try {
        loading.value = true
        const res = await axios.delete(`/api/source/delete?name=${name}`)

        ElMessage.success(res.data)
        await fetchSubNames()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveSource = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/source/set', sourceData)

        ElMessage.success(res.data)
        closeEditor()
        await fetchSubNames()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const openEditor = () => {
    showEditor.value = true
}

const closeEditor = () => {
    showEditor.value = false
}

const fetchSubSecret = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/sub/secret/get')
        Object.assign(subSecretData, res.data)
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const setSubSecret = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/sub/secret/set', subSecretData)
        ElMessage.success(res.data)
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchSubNames()
    fetchSubSecret()
})
</script>

<template>
    <div class="container">
        <div class="flex-center">
            <el-button type="primary" :loading="loading" @click="fetchSubNames" :icon="Refresh" />
            <el-button type="primary" :loading="loading" @click="addSource" :icon="Plus" />
            <div class="flex-1"></div>
            <el-button type="warning" :loading="loading" @click="doLogout" :icon="DArrowRight" />
        </div>
        <el-table v-loading="loading" border :data="subNames">
            <el-table-column label="名称" width="auto">
                <template #default="scope">
                    <span>{{ scope.row }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
                <template #default="scope">
                    <el-button link type="primary" @click="editSource(scope.$index)">编辑</el-button>
                    <el-button link type="danger" @click="deleteSource(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
            <template #empty>
                <span>没有数据</span>
            </template>
        </el-table>
        <SourceEditor :show="showEditor" :data="sourceData" :loading="loading" @close="closeEditor" @save="saveSource" />
        <div class="sub-secret-container flex-center">
            <span>订阅密钥</span>
            <el-input class="flex-1" v-model="subSecretData.secret" />
            <el-button type="primary" :loading="loading" @click="fetchSubSecret">获取</el-button>
            <el-button type="primary" :loading="loading" @click="setSubSecret">设置</el-button>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding: 20px;
}

.el-table {
    margin: 10px 0;
}

.sub-secret-container {
    column-gap: 5px;
}

.sub-secret-container .el-button {
    margin: 0;
}
</style>
