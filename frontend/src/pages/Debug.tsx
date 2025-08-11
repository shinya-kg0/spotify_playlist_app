import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Code,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { authAPI } from '../utils/apiClient';
import { API_BASE_URL } from '../config/api';

function Debug() {
  const [cookies, setCookies] = useState<string>('');
  const [userAgent, setUserAgent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // 基本情報の取得
    setCookies(document.cookie);
    setUserAgent(navigator.userAgent);
    
    // 初期情報をログに追加
    addTestResult('Page loaded', {
      userAgent: navigator.userAgent,
      cookies: document.cookie,
      apiBaseUrl: API_BASE_URL,
      currentUrl: window.location.href
    });
  }, []);

  const addTestResult = (test: string, result: any) => {
    const timestamp = new Date().toISOString();
    setTestResults(prev => [...prev, { timestamp, test, result }]);
    console.log(`[${timestamp}] ${test}:`, result);
  };

  // Cookie詳細テスト
  const testCookies = () => {
    const cookieTests = {
      hasCookies: document.cookie.length > 0,
      cookieEnabled: navigator.cookieEnabled,
      cookieDetails: document.cookie.split(';').map(c => c.trim()),
      hasAccessToken: document.cookie.includes('access_token'),
      hasRefreshToken: document.cookie.includes('refresh_token'),
      hasExpiresAt: document.cookie.includes('expires_at')
    };
    
    addTestResult('Cookie Tests', cookieTests);
  };

  // ネットワーク接続テスト
  const testNetworkConnectivity = async () => {
    try {
      // まずはヘルスチェックエンドポイント
      const healthUrl = `${API_BASE_URL}/health`;
      addTestResult('Testing health endpoint', { url: healthUrl });
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      const healthData = await healthResponse.json();
      addTestResult('Health check result', {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: healthData
      });
      
    } catch (err: any) {
      addTestResult('Network test failed', {
        error: err.message,
        stack: err.stack
      });
    }
  };

  // 認証API テスト
  const testAuthAPI = async () => {
    try {
      setError('');
      addTestResult('Starting /auth/me test', { apiBaseUrl: API_BASE_URL });
      
      const response = await authAPI.getCurrentUser();
      const responseHeaders = Object.fromEntries(response.headers.entries());
      
      addTestResult('Auth API Response Headers', responseHeaders);
      
      const data = await response.json();
      const responseData = {
        status: response.status,
        ok: response.ok,
        data: data
      };
      
      addTestResult('Auth API Result', responseData);
      
    } catch (err: any) {
      const errorInfo = {
        message: err.message,
        stack: err.stack,
        name: err.name
      };
      setError(err.message);
      addTestResult('Auth API Error', errorInfo);
    }
  };

  // ログイン URL テスト
  const testLoginUrl = async () => {
    try {
      addTestResult('Testing login URL endpoint', {});
      
      const response = await authAPI.getLoginUrl();
      const data = await response.json();
      
      addTestResult('Login URL Test Result', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
    } catch (err: any) {
      addTestResult('Login URL Test Error', {
        message: err.message,
        stack: err.stack
      });
    }
  };

  // トークン交換テスト（サンプルコード）
  const testTokenExchange = async () => {
    const dummyCode = 'test_code_123';
    try {
      addTestResult('Testing token exchange endpoint', { code: dummyCode });
      
      const response = await authAPI.exchangeToken(dummyCode);
      const data = await response.json();
      
      addTestResult('Token Exchange Test Result', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
    } catch (err: any) {
      addTestResult('Token Exchange Test Error', {
        message: err.message,
        stack: err.stack
      });
    }
  };

  const clearTests = () => {
    setTestResults([]);
    setError('');
  };

  return (
    <Box maxW="4xl" mx="auto" my={10} p={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="lg">
          モバイルデバッグツール
        </Heading>

        {/* 基本情報 */}
        <Box>
          <Heading as="h2" size="md" mb={2}>
            基本情報
          </Heading>
          <VStack align="start" spacing={2} fontSize="sm">
            <Text><strong>API Base URL:</strong> {API_BASE_URL}</Text>
            <Text><strong>Current URL:</strong> {window.location.href}</Text>
            <Text><strong>Protocol:</strong> {window.location.protocol}</Text>
            <Text><strong>Is Mobile Safari:</strong> {/Safari/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent) ? 'Yes' : 'No'}</Text>
            <Text><strong>Cookie Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}</Text>
          </VStack>
        </Box>

        <Divider />

        {/* テストボタン */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            テスト実行
          </Heading>
          <VStack spacing={2}>
            <Button onClick={testCookies} colorScheme="blue" size="sm" w="full">
              Cookie状態をチェック
            </Button>
            <Button onClick={testNetworkConnectivity} colorScheme="green" size="sm" w="full">
              ネットワーク接続テスト
            </Button>
            <Button onClick={testLoginUrl} colorScheme="purple" size="sm" w="full">
              ログインURL取得テスト
            </Button>
            <Button onClick={testTokenExchange} colorScheme="orange" size="sm" w="full">
              トークン交換テスト
            </Button>
            <Button onClick={testAuthAPI} colorScheme="teal" size="sm" w="full">
              認証API (/auth/me) テスト
            </Button>
            <Button onClick={clearTests} colorScheme="gray" variant="outline" size="sm" w="full">
              ログをクリア
            </Button>
          </VStack>
        </Box>

        <Divider />

        {/* 現在のCookie状態 */}
        <Box>
          <Heading as="h2" size="md" mb={2}>
            現在のCookie
          </Heading>
          <Code p={2} w="100%" whiteSpace="pre-wrap" fontSize="xs">
            {cookies || 'No cookies found'}
          </Code>
        </Box>

        <Divider />

        {/* エラー表示 */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">エラー:</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
        )}

        {/* テスト結果ログ */}
        <Box>
          <Heading as="h2" size="md" mb={2}>
            テスト結果ログ
          </Heading>
          <Box 
            maxH="400px" 
            overflowY="auto" 
            border="1px solid" 
            borderColor="gray.200" 
            borderRadius="md" 
            p={4}
            bg="gray.50"
          >
            {testResults.length === 0 ? (
              <Text color="gray.500" fontSize="sm">テストを実行してください</Text>
            ) : (
              testResults.map((item, index) => (
                <Box key={index} mb={3} fontSize="xs">
                  <Text color="blue.600" fontWeight="bold">
                    [{new Date(item.timestamp).toLocaleTimeString()}] {item.test}
                  </Text>
                  <Code p={2} display="block" whiteSpace="pre-wrap" mt={1}>
                    {typeof item.result === 'object' 
                      ? JSON.stringify(item.result, null, 2) 
                      : item.result}
                  </Code>
                </Box>
              ))
            )}
          </Box>
        </Box>

        <Divider />

        {/* User Agent */}
        <Box>
          <Heading as="h2" size="md" mb={2}>
            User Agent
          </Heading>
          <Code p={2} w="100%" whiteSpace="pre-wrap" fontSize="xs">
            {userAgent}
          </Code>
        </Box>
      </VStack>
    </Box>
  );
}

export default Debug;