const fs = require('fs');

const path = 'c:\\Users\\Bhush\\Desktop\\FresherX\\app\\app\\(recruiter)\\dashboard\\index.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Import FlashList
code = code.replace(
  "import { BarChart } from 'react-native-gifted-charts';",
  "import { BarChart } from 'react-native-gifted-charts';\nimport { FlashList } from '@shopify/flash-list';"
);

// 2. Replace ScrollView start
code = code.replace(
  "<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>",
  `<FlashList
        data={analytics || []}
        estimatedItemSize={120}
        keyExtractor={(item) => item.jobId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>`
);

// 3. Replace Performance Analytics start
code = code.replace(
  `        {/* Performance Analytics */}
        {analytics && analytics.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                Performance Analytics
              </Text>
            </View>
            <View style={{ paddingHorizontal: 16, gap: 16 }}>
              {analytics.map((item) => (`,
  `        {/* Performance Analytics Header */}
        {analytics && analytics.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24, paddingBottom: 16 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                Performance Analytics
              </Text>
            </View>
          </Animated.View>
        )}
          </>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>`
);

// 4. Replace ScrollView end
code = code.replace(
  `              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>`,
  `          </View>
        )}
      />`
);

fs.writeFileSync(path, code);
console.log('Dashboard refactored successfully.');
