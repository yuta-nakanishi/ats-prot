'use client';

import { 
  Typography, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Button,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';

// システムロールとその権限の定義
const systemRoles = [
  {
    name: '企業管理者 (company_admin)',
    description: '企業の全てのデータに対する管理権限を持ちます。',
    permissions: [
      { resource: '企業', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: 'ユーザー', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '部署', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: 'チーム', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '求人', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '候補者', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '面接', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '評価', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: 'レポート', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
    ]
  },
  {
    name: '採用マネージャー (hiring_manager)',
    description: '採用プロセス全体を管理する権限を持ちます。',
    permissions: [
      { resource: '企業', actions: ['閲覧'] },
      { resource: 'ユーザー', actions: ['閲覧'] },
      { resource: '部署', actions: ['閲覧', '更新'] },
      { resource: 'チーム', actions: ['閲覧', '作成', '更新'] },
      { resource: '求人', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '候補者', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '面接', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '評価', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: 'レポート', actions: ['閲覧'] },
    ]
  },
  {
    name: '採用担当者 (recruiter)',
    description: '候補者の管理、面接のスケジュール、評価の入力などを行います。',
    permissions: [
      { resource: '企業', actions: ['閲覧'] },
      { resource: 'ユーザー', actions: ['閲覧'] },
      { resource: '部署', actions: ['閲覧'] },
      { resource: 'チーム', actions: ['閲覧'] },
      { resource: '求人', actions: ['閲覧'] },
      { resource: '候補者', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '面接', actions: ['閲覧', '作成', '更新', '削除', '管理'] },
      { resource: '評価', actions: ['閲覧', '作成', '更新'] },
      { resource: 'レポート', actions: ['閲覧'] },
    ]
  },
  {
    name: '面接官 (interviewer)',
    description: '候補者の閲覧と評価の入力権限を持ちます。',
    permissions: [
      { resource: '部署', actions: ['閲覧'] },
      { resource: 'チーム', actions: ['閲覧'] },
      { resource: '候補者', actions: ['閲覧'] },
      { resource: '面接', actions: ['閲覧'] },
      { resource: '評価', actions: ['閲覧', '作成'] },
    ]
  },
  {
    name: '閲覧専用 (readonly)',
    description: 'すべてのデータを閲覧できますが、変更はできません。',
    permissions: [
      { resource: '企業', actions: ['閲覧'] },
      { resource: 'ユーザー', actions: ['閲覧'] },
      { resource: '部署', actions: ['閲覧'] },
      { resource: 'チーム', actions: ['閲覧'] },
      { resource: '求人', actions: ['閲覧'] },
      { resource: '候補者', actions: ['閲覧'] },
      { resource: '面接', actions: ['閲覧'] },
      { resource: '評価', actions: ['閲覧'] },
      { resource: 'レポート', actions: ['閲覧'] },
    ]
  }
];

// すべてのアクション
const allActions = ['閲覧', '作成', '更新', '削除', '管理'];

export default function SystemRolesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          戻る
        </Button>
        <Typography variant="h4">
          システムロール権限一覧
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        以下は、システムに定義されている各システムロールが持つ権限の一覧です。ユーザーに与えられたシステムロールに基づいて、システム内での操作権限が決定されます。
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* システムロールのカード一覧 */}
      {systemRoles.map((role, index) => (
        <Card key={index} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {role.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {role.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              権限一覧
            </Typography>
            
            <Grid container spacing={2}>
              {role.permissions.map((permission, permIndex) => (
                <Grid item xs={12} sm={6} md={4} key={permIndex}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {permission.resource}
                      </Typography>
                      <List dense>
                        {allActions.map((action, actionIndex) => (
                          <ListItem key={actionIndex}>
                            <ListItemIcon sx={{ minWidth: '30px' }}>
                              {permission.actions.includes(action) ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : (
                                <CancelIcon color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={action} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
} 