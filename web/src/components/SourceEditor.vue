<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
    show: {
        type: Boolean,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        required: true
    }
})

defineEmits(['save', 'cancel'])
</script>

<template></template>

<style scoped></style>
